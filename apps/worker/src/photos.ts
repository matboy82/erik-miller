import type { Photo } from './project.ts';

type PhotoRow = { photo_index: number; phase: string; upload_id: string | null; file_id: string | null; lease_until: string | null };
type Call = (operation: Record<string, unknown>) => Promise<Record<string, unknown>>;
type Environment = { INTAKE_DB: D1Database; INTAKE_PHOTOS: R2Bucket; JOBTREAD_ORGANIZATION_ID: string; JOBTREAD_TRANSFER_ORIGINS?: string; JOBTREAD_API_KEY: string };

function transferUrl(value: unknown, origins: string[]): string {
  if (typeof value !== 'string') throw new Error('photo_transfer_invalid');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || !origins.includes(url.origin)
    || url.origin === 'https://api.jobtread.com') throw new Error('photo_transfer_invalid');
  return value;
}

export async function deliverPhotos(receiptId: string, jobId: string, photos: Photo[], env: Environment, call: Call): Promise<void> {
  const origins = (env.JOBTREAD_TRANSFER_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  if (!origins.length) throw new Error('photo_delivery_not_configured');
  for (const [index, photo] of photos.entries()) {
    const row = await env.INTAKE_DB.prepare('SELECT * FROM intake_photos WHERE receipt_id = ?1 AND photo_index = ?2').bind(receiptId, index).first<PhotoRow>();
    if (!row) throw new Error('photo_ledger_missing');
    if (row.phase === 'verified') {
      // Cleanup is retried until it succeeds, including after a prior verified checkpoint.
      await env.INTAKE_PHOTOS.delete(photo.key);
      continue;
    }
    if (row.phase.endsWith('_writing')) throw new Error(row.lease_until && Date.parse(row.lease_until) > Date.now() ? 'photo_claimed' : 'photo_result_unknown');
    const object = await env.INTAKE_PHOTOS.get(photo.key);
    if (!object) throw new Error('photo_staging_missing');
    const bytes = await object.arrayBuffer();
    const checksum = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (byte) => byte.toString(16).padStart(2, '0')).join('');
    if (checksum !== photo.sha256) throw new Error('photo_checksum_failed');
    const claim = async (phase: string) => {
      const until = new Date(Date.now() + 60_000).toISOString();
      const result = await env.INTAKE_DB.prepare(
        'UPDATE intake_photos SET phase = ?1, lease_until = ?2 WHERE receipt_id = ?3 AND photo_index = ?4 AND phase = ?5',
      ).bind(phase, until, receiptId, index, row.phase).run();
      if (!result.success || result.meta?.changes !== 1) throw new Error('photo_claimed');
      row.phase = phase;
    };
    const checkpoint = async (phase: string, column?: 'upload_id' | 'file_id', id?: string) => {
      const result = await env.INTAKE_DB.prepare(column
        ? `UPDATE intake_photos SET phase = ?1, ${column} = ?2, lease_until = NULL WHERE receipt_id = ?3 AND photo_index = ?4 AND phase = ?5`
        : 'UPDATE intake_photos SET phase = ?1, lease_until = NULL WHERE receipt_id = ?2 AND photo_index = ?3 AND phase = ?4',
      ).bind(...(column ? [phase, id!, receiptId, index, row.phase] : [phase, receiptId, index, row.phase])).run();
      if (!result.success || result.meta?.changes !== 1) throw new Error('photo_checkpoint_failed');
      row.phase = phase;
    };
    if (!row.upload_id) {
      await claim('upload_writing');
      const result = await call({ createUploadRequest: { $: { organizationId: env.JOBTREAD_ORGANIZATION_ID, size: photo.size, type: photo.type }, createdUploadRequest: { id: {} } } });
      const id = (result.createUploadRequest as { createdUploadRequest?: { id?: string } })?.createdUploadRequest?.id;
      if (!id) throw new Error('photo_result_unknown');
      await checkpoint('upload_created', 'upload_id', id);
      row.upload_id = id;
    }
    if (!row.file_id) {
      const result = await call({ uploadRequest: { $: { id: row.upload_id }, url: {}, method: {}, headers: {} } });
      const upload = result.uploadRequest as { url?: string; method?: string; headers?: Record<string, string> };
      if (upload?.method !== 'PUT' || !upload.headers || upload.url?.includes(env.JOBTREAD_API_KEY)
        || Object.entries(upload.headers).some(([key, value]) => /authorization|cookie/i.test(key) || typeof value !== 'string' || value.includes(env.JOBTREAD_API_KEY))) throw new Error('photo_transfer_invalid');
      const response = await fetch(transferUrl(upload.url, origins), { method: 'PUT', headers: upload.headers, body: bytes, redirect: 'error', signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`photo_upload_failed_${response.status}`);
      await claim('file_writing');
      const fileResult = await call({ createFile: { $: { name: `Project photo ${index + 1}`, targetId: jobId, targetType: 'job', uploadRequestId: row.upload_id }, createdFile: { id: {} } } });
      const id = (fileResult.createFile as { createdFile?: { id?: string } })?.createdFile?.id;
      if (!id) throw new Error('photo_result_unknown');
      await checkpoint('file_created', 'file_id', id);
      row.file_id = id;
    }
    const readback = await call({ file: { $: { id: row.file_id }, id: {}, job: { id: {} }, url: { $: { original: true } } } });
    const file = readback.file as { id?: string; job?: { id?: string }; url?: string };
    if (file?.id !== row.file_id || file.job?.id !== jobId) throw new Error('photo_readback_failed');
    if (file.url?.includes(env.JOBTREAD_API_KEY)) throw new Error('photo_transfer_invalid');
    const download = await fetch(transferUrl(file.url, origins), { redirect: 'error', signal: AbortSignal.timeout(30_000) });
    if (!download.ok || Number(download.headers.get('Content-Length')) > photo.size) throw new Error('photo_readback_failed');
    const reader = download.body?.getReader();
    if (!reader) throw new Error('photo_readback_failed');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > photo.size) { await reader.cancel(); throw new Error('photo_checksum_failed'); }
      chunks.push(part.value);
    }
    const downloaded = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { downloaded.set(chunk, offset); offset += chunk.length; }
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', downloaded)), (byte) => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== photo.sha256) throw new Error('photo_checksum_failed');
    await checkpoint('verified');
    await env.INTAKE_PHOTOS.delete(photo.key);
  }
}
