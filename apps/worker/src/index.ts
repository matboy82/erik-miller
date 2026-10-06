import { decodeProject, MAX_PROJECT_BYTES, type ProjectPayload } from './project.ts';
import { deliverPhotos } from './photos.ts';
import { operatorPage } from './operator.ts';
import { recordBooking, validBooking } from './booking.ts';
import { syncCalendar, type CalendarEnvironment } from './calendar.ts';
import { googleAuthorization } from './google-auth.ts';
import { approvedConversion, captureConversion, captureCompletedJob, cleanupConversion, conversionOperator, conversionPublic, runConversion, type ConversionEnvironment } from './conversion.ts';

export interface IntakeEnvironment extends CalendarEnvironment, ConversionEnvironment {
  INTAKE_ENABLED?: string;
  INTAKE_DB?: D1Database;
  INTAKE_QUEUE?: Queue<string>;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  OPERATOR_EMAILS?: string;
  JOBTREAD_API_KEY?: string;
  JOBTREAD_ORGANIZATION_ID?: string;
  JOBTREAD_EMAIL_CUSTOM_FIELD_ID?: string;
  JOBTREAD_PHONE_CUSTOM_FIELD_ID?: string;
  INTAKE_PHOTOS?: R2Bucket;
  JOBTREAD_TRANSFER_ORIGINS?: string;
  ALLOWED_ORIGINS?: string;
  TURNSTILE_SECRET_KEY?: string;
  INTAKE_MODE?: string;
  GOOGLE_OAUTH_REDIRECT_URI?: string;
}

const noStoreHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: noStoreHeaders });
}

function validatePayload(value: unknown): { ok: true; payload: Record<string, string> } | { ok: false; fields: string[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, fields: ['body'] };
  const input = value as Record<string, unknown>;
  const allowed = new Set(['name', 'email', 'phone', 'message']);
  const fields = new Set<string>();
  if (Object.keys(input).some((field) => !allowed.has(field))) fields.add('body');

  const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const rawPhone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const digits = rawPhone.replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  const phone = rawPhone ? `+1${national}` : '';
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  if (name.length < 1 || name.length > 120) fields.add('name');
  if ((email.length > 0) === (phone.length > 0)) fields.add('contact');
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) fields.add('email');
  if (rawPhone && (rawPhone.length > 32 || !/^[+\d().\-\s]+$/.test(rawPhone) || !/^[2-9]\d{2}[2-9]\d{6}$/.test(national)
    || (rawPhone.includes('+') && !/^\+1[^+]*$/.test(rawPhone)))) fields.add('phone');
  if (message.length < 1 || message.length > 5000) fields.add('message');
  const payload: Record<string, string> = email
    ? { name, email, message }
    : { name, phone, message };
  if (fields.size) return { ok: false, fields: [...fields].sort() };
  return { ok: true, payload };
}

async function acceptInquiry(request: Request, env: IntakeEnvironment, isProject = false, isGuide = false): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { ...noStoreHeaders, Allow: 'POST' } });
  if (env.INTAKE_ENABLED !== 'true') return json({ error: 'intake_disabled' }, 503);
  if (env.INTAKE_MODE !== 'synthetic' && !env.TURNSTILE_SECRET_KEY) return json({ error: 'verification_not_configured' }, 503);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({ error: 'validation_failed', fields: ['body'] }, 400);
  const key = request.headers.get('Idempotency-Key') ?? '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
    return json({ error: 'validation_failed', fields: ['idempotencyKey'] }, 400);
  }
  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  const maxBytes = isProject ? MAX_PROJECT_BYTES : 8192;
  if (contentLength > maxBytes) return json({ error: 'validation_failed', fields: ['body'] }, 400);

  let parsed: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'validation_failed', fields: ['body'] }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return json({ error: 'validation_failed', fields: ['body'] }, 400);
      }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes);
    parsed = JSON.parse(text);
  } catch {
    return json({ error: 'validation_failed', fields: ['body'] }, 400);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json({ error: 'validation_failed', fields: ['body'] }, 400);
  const input = parsed as Record<string, unknown>;
  const { turnstileToken, followupConsent, ...lead } = input;
  if (followupConsent !== undefined && typeof followupConsent !== 'boolean') return json({ error: 'validation_failed', fields: ['followupConsent'] }, 400);
  if (followupConsent === true && !lead.email) return json({ error: 'validation_failed', fields: ['email'] }, 400);
  const conversion = isGuide ? await approvedConversion(env) : null;
  if (isGuide && !conversion?.guide.enabled) return json({ error: 'guide_unavailable' }, 503);
  if (isGuide && (typeof lead.email !== 'string' || Object.keys(lead).some(field => !['name','email','phone'].includes(field)))) return json({ error: 'validation_failed', fields: ['email','body'] }, 400);
  if (env.TURNSTILE_SECRET_KEY) {
    if (typeof turnstileToken !== 'string' || turnstileToken.length > 2048) return json({ error: 'verification_required' }, 400);
    try {
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: turnstileToken }),
        signal: AbortSignal.timeout(10_000),
      });
      const result = await verification.json() as { success?: boolean; hostname?: string };
      const hosts = (env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean).map((origin) => new URL(origin.trim()).hostname);
      if (!result.success || !result.hostname || !hosts.includes(result.hostname)) return json({ error: 'verification_required' }, 400);
    } catch { return json({ error: 'verification_unavailable' }, 503); }
  }
  let projectData: Awaited<ReturnType<typeof decodeProject>> | undefined;
  if (isProject) {
    if (Object.keys(lead).some((field) => !['name', 'email', 'phone', 'project', 'photos'].includes(field))) return json({ error: 'validation_failed', fields: ['body'] }, 400);
    try { projectData = await decodeProject(lead, key); }
    catch { return json({ error: 'validation_failed', fields: ['project', 'photos'] }, 400); }
  }
  const guidePhone = isGuide && typeof lead.phone === 'string' ? lead.phone.trim() : '';
  if (guidePhone && !validatePayload({name:lead.name,phone:guidePhone,message:'Cost guide'}).ok) return json({error:'validation_failed',fields:['phone']},400);
  const validated = validatePayload(isProject ? { name: lead.name, email: lead.email, phone: lead.phone, message: projectData!.message.slice(0, 5000) } : isGuide ? {name:lead.name,email:lead.email,message:'Website lead type: lead_magnet\nCost-guide request'} : lead);
  if (!validated.ok) return json({ error: 'validation_failed', fields: validated.fields }, 400);
  if (!env.INTAKE_DB || !env.INTAKE_QUEUE) return json({ error: 'intake_unavailable' }, 503);

  try {
    const existing = await env.INTAKE_DB.prepare(
      'SELECT receipt_id, state, payload, delivery_step FROM intake_submissions WHERE idempotency_key = ?1',
    ).bind(key).first<{ receipt_id: string; state: string; payload: string | null; delivery_step: string }>();
    const normalizedGuidePhone = guidePhone ? validatePayload({name:lead.name,phone:guidePhone,message:'Cost guide'}) : null;
    const basePayload = projectData ? { ...validated.payload, message: projectData.message, project: projectData.project, fit: 'needs-review', photos: projectData.photos } : isGuide ? {...validated.payload,leadType:'lead_magnet',...(normalizedGuidePhone?.ok?{phone:normalizedGuidePhone.payload.phone}: {})} : validated.payload;
    const payload = { ...basePayload, ...(followupConsent !== undefined ? {followupConsent} : {}) };
    const serializedPayload = JSON.stringify(payload);
    if (existing?.payload === null) return json({ error: 'receipt_expired' }, 410);
    if (existing && existing.payload !== serializedPayload) return json({ error: 'idempotency_conflict' }, 409);
    if (!isGuide && existing && (existing.state === 'delivered' || existing.state === 'processing' || existing.delivery_step.endsWith('_writing'))) {
      // The delivery consumer already received this durable inquiry. A browser retry only needs its receipt.
      return json({ receiptId: existing.receipt_id, state: 'accepted' }, 202);
    }
    const receiptId = existing?.receipt_id ?? crypto.randomUUID();
    if (!existing) {
      if (projectData?.photos.length && !env.INTAKE_PHOTOS) return json({ error: 'photos_unavailable' }, 503);
      for (const upload of projectData?.uploads ?? []) {
        await env.INTAKE_PHOTOS!.put(upload.key, upload.bytes, { httpMetadata: { contentType: upload.type } });
      }
      const now = new Date().toISOString();
      const payloadExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const metadataExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const insert = env.INTAKE_DB.prepare(
        `INSERT INTO intake_submissions
          (receipt_id, idempotency_key, state, created_at, updated_at, payload_expires_at, metadata_expires_at, payload)
         VALUES (?1, ?2, 'accepted', ?3, ?3, ?4, ?5, ?6)`,
      ).bind(receiptId, key, now, payloadExpiresAt, metadataExpiresAt, serializedPayload);
      const result = projectData?.photos.length
        ? (await env.INTAKE_DB.batch([insert, ...projectData.photos.map((_, index) => env.INTAKE_DB!.prepare(
          'INSERT INTO intake_photos (receipt_id, photo_index) VALUES (?1, ?2)',
        ).bind(receiptId, index))]))[0]
        : await insert.run();
      if (!result.success) return json({ error: 'intake_unavailable' }, 503);
    }
    // Capture opt-in and the exact approved guide before queueing. A retry repairs a failed capture.
    if (isGuide || followupConsent !== undefined) await captureConversion(env,receiptId,payload,isGuide ? `${conversion!.guide.title}\n\n${conversion!.guide.text}\n\nPlanning ranges only, not a quote. Final scope and pricing require a project-specific design and proposal.` : undefined);
    if (!existing || !['delivered','processing'].includes(existing.state)) await env.INTAKE_QUEUE.send(receiptId);
    const guide = isGuide ? await env.INTAKE_DB.prepare('SELECT download_token FROM conversion_leads WHERE receipt_id = ?1').bind(receiptId).first<{download_token:string}>() : null;
    return json({ receiptId, state: 'accepted', ...(guide ? {downloadUrl:`${new URL(request.url).origin}/conversion/download?token=${guide.download_token}`} : {}) }, 202);
  } catch {
    return json({ error: 'intake_unavailable' }, 503);
  }
}

async function operatorEmail(request: Request, env: IntakeEnvironment): Promise<string | null> {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.OPERATOR_EMAILS) return null;
  const assertion = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!assertion) return null;
  const parts = assertion.split('.');
  if (parts.length !== 3) return null;
  try {
    const decode = (part: string) => JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    const header = decode(parts[0]) as { kid?: string; alg?: string };
    const claims = decode(parts[1]) as { aud?: string | string[]; exp?: number; email?: string; iss?: string };
    if (header.alg !== 'RS256' || !header.kid || !claims.email || !claims.exp || claims.exp <= Date.now() / 1000) return null;
    const issuer = `https://${env.ACCESS_TEAM_DOMAIN}`;
    if (claims.iss !== issuer) return null;
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audiences.includes(env.ACCESS_AUD)) return null;
    const jwksResponse = await fetch(`${issuer}/cdn-cgi/access/certs`);
    if (!jwksResponse.ok) return null;
    const jwks = await jwksResponse.json() as { keys?: (JsonWebKey & { kid?: string })[] };
    const jwk = jwks.keys?.find((candidate) => candidate.kid === header.kid && candidate.kty === 'RSA');
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0));
    if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data)) return null;
    const allowed = env.OPERATOR_EMAILS.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
    return allowed.includes(claims.email.toLowerCase()) ? claims.email.toLowerCase() : null;
  } catch {
    return null;
  }
}

async function operatorRoute(request: Request, env: IntakeEnvironment, path: string): Promise<Response> {
  const email = await operatorEmail(request, env);
  if (!email) return json({ error: 'operator_unauthorized' }, 401);
  if (path.startsWith('/operator/conversion/')) {
    try { return await conversionOperator(request,env,email,operation=>{
      if(!env.JOBTREAD_API_KEY)throw new Error('delivery_not_configured');
      return jobTreadCall(env.JOBTREAD_API_KEY,operation);
    }); }
    catch { return json({error:'conversion_unavailable'},503); }
  }
  if (path === '/operator/readiness' && request.method === 'GET') {
    const tokenStored = await env.INTAKE_DB?.prepare("SELECT name FROM integration_state WHERE name = 'google-refresh-token'").first();
    return json({ intakeEnabled: env.INTAKE_ENABLED === 'true', mode: env.INTAKE_MODE === 'synthetic' ? 'synthetic' : 'live',
      spamProtectionConfigured: Boolean(env.TURNSTILE_SECRET_KEY && env.ALLOWED_ORIGINS),
      databaseBound: Boolean(env.INTAKE_DB), queueBound: Boolean(env.INTAKE_QUEUE), photoStorageBound: Boolean(env.INTAKE_PHOTOS),
      jobtreadConfigured: Boolean(env.JOBTREAD_API_KEY && env.JOBTREAD_ORGANIZATION_ID && env.JOBTREAD_EMAIL_CUSTOM_FIELD_ID && env.JOBTREAD_PHONE_CUSTOM_FIELD_ID),
      photoTransferOriginsConfigured: Boolean(env.JOBTREAD_TRANSFER_ORIGINS),
      googleConfigured: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_BOOKING_CALENDAR_ID && (env.GOOGLE_REFRESH_TOKEN || (tokenStored && env.GOOGLE_TOKEN_ENCRYPTION_KEY))),
      bookingSyncEnabled: env.BOOKING_SYNC_ENABLED === 'true' });
  }
  if (path === '/operator/calendar/sync' && request.method === 'POST') {
    await syncCalendar(env, (operation) => {
      if (!env.JOBTREAD_API_KEY) throw new Error('delivery_not_configured');
      return jobTreadCall(env.JOBTREAD_API_KEY, operation);
    });
    return json({ status: 'sync_attempted', enabled: env.BOOKING_SYNC_ENABLED === 'true' });
  }
  if (['/operator/google/connect', '/operator/google/callback'].includes(path)) {
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
    try { return await googleAuthorization(request, env, email); }
    catch { return json({ error: 'google_connection_failed' }, 503); }
  }
  if ((path === '/operator/' || path === '/operator') && request.method === 'GET') return operatorPage();
  if (!env.INTAKE_DB || !env.INTAKE_QUEUE) return json({ error: 'operator_unavailable' }, 503);
  const match = /^\/operator\/intake\/([0-9a-f-]{36})(?:\/(retry|reconcile|booking|booking-reconcile))?$/.exec(path);
  if (!match) return json({ error: 'not_found' }, 404);
  const [, receiptId, action] = match;
  try {
    if (action === 'booking-reconcile' && request.method === 'POST') {
      const body = await request.text();
      if (body.length > 2048) return json({ error: 'validation_failed' }, 400);
      let input: { eventId?: string; outcome?: string; recordId?: string };
      try { input = JSON.parse(body); } catch { return json({ error: 'validation_failed' }, 400); }
      if (!input || !/^[a-zA-Z0-9_-]{1,200}$/.test(input.eventId ?? '') || !['present', 'absent'].includes(input.outcome ?? '')
        || Object.keys(input).some((key) => !['eventId', 'outcome', 'recordId'].includes(key))) return json({ error: 'validation_failed' }, 400);
      const row = await env.INTAKE_DB.prepare('SELECT phase, payload, task_id FROM intake_bookings WHERE event_id = ?1 AND receipt_id = ?2').bind(input.eventId!, receiptId).first<{ phase: string; payload: string; task_id: string | null }>();
      if (!row || !['writing', 'created'].includes(row.phase)) return json({ error: 'reconciliation_not_required' }, 409);
      const booking = JSON.parse(row.payload) as { cancelled?: boolean };
      if (input.outcome === 'present' && !/^[a-zA-Z0-9_-]{1,128}$/.test(input.recordId ?? '')) return json({ error: 'validation_failed' }, 400);
      if (input.outcome === 'present' && row.task_id && input.recordId !== row.task_id) return json({ error: 'booking_record_mismatch' }, 409);
      if (booking.cancelled && input.outcome === 'present') {
        const result = await env.INTAKE_DB.prepare("UPDATE intake_bookings SET phase = 'verified', payload = ?1 WHERE event_id = ?2 AND receipt_id = ?3 AND phase = ?4").bind(JSON.stringify({ ...booking, cancelled: false }), input.eventId!, receiptId, row.phase).run();
        if (!result.success || result.meta?.changes !== 1) return json({ error: 'reconciliation_conflict' }, 409);
        return json({ receiptId, booking: 'reconciled_pending_cancellation_retry' }, 202);
      }
      const result = input.outcome === 'present'
        ? await env.INTAKE_DB.prepare("UPDATE intake_bookings SET task_id = ?1, phase = 'created' WHERE event_id = ?2 AND receipt_id = ?3 AND phase = ?4").bind(input.recordId!, input.eventId!, receiptId, row.phase).run()
        : booking.cancelled
          ? await env.INTAKE_DB.prepare("UPDATE intake_bookings SET phase = 'created' WHERE event_id = ?1 AND receipt_id = ?2 AND phase = ?3").bind(input.eventId!, receiptId, row.phase).run()
          : await env.INTAKE_DB.prepare('DELETE FROM intake_bookings WHERE event_id = ?1 AND receipt_id = ?2 AND phase = ?3').bind(input.eventId!, receiptId, row.phase).run();
      if (!result.success || result.meta?.changes !== 1) return json({ error: 'reconciliation_conflict' }, 409);
      console.info(JSON.stringify({ event: 'booking_reconciled', outcome: input.outcome }));
      return json({ receiptId, booking: 'reconciled_pending_sync' }, 202);
    }
    if (action === 'booking' && request.method === 'POST') {
      if (!env.JOBTREAD_API_KEY) return json({ error: 'delivery_not_configured' }, 503);
      const body = await request.text();
      if (body.length > 2048) return json({ error: 'validation_failed' }, 400);
      let input: unknown;
      try { input = JSON.parse(body); } catch { return json({ error: 'validation_failed' }, 400); }
      if (!validBooking(input)) return json({ error: 'validation_failed' }, 400);
      const result = await recordBooking(receiptId, input, env.INTAKE_DB, (operation) => jobTreadCall(env.JOBTREAD_API_KEY!, operation));
      return json(result.body, result.status);
    }
    if (action === 'retry' && request.method === 'POST') {
      const current = await env.INTAKE_DB.prepare(
        'SELECT state, delivery_step, payload FROM intake_submissions WHERE receipt_id = ?1',
      ).bind(receiptId).first<{ state: string; delivery_step: string; payload: string | null }>();
      if (!current) return json({ error: 'not_found' }, 404);
      if (!current.payload) return json({ error: 'receipt_expired' }, 410);
      if (!['delayed', 'failed'].includes(current.state)) return json({ error: 'retry_not_available' }, 409);
      if (current.delivery_step.endsWith('_writing')) return json({ error: 'reconciliation_required' }, 409);
      const result = await env.INTAKE_DB.prepare(
        `UPDATE intake_submissions SET state = 'accepted', updated_at = ?1
         WHERE receipt_id = ?2 AND state IN ('delayed', 'failed')`,
      ).bind(new Date().toISOString(), receiptId).run();
      if (!result.success) return json({ error: 'operator_unavailable' }, 503);
      await env.INTAKE_QUEUE.send(receiptId);
      return json({ receiptId, state: 'accepted' }, 202);
    }
    if (action === 'reconcile' && request.method === 'POST') {
      const current = await env.INTAKE_DB.prepare(
        'SELECT state, delivery_step, payload FROM intake_submissions WHERE receipt_id = ?1',
      ).bind(receiptId).first<{ state: string; delivery_step: string; payload: string | null }>();
      if (!current) return json({ error: 'not_found' }, 404);
      if (current.state !== 'failed' || !current.delivery_step.endsWith('_writing')) {
        return json({ error: 'reconciliation_not_required' }, 409);
      }
      if (!current.payload) return json({ error: 'receipt_expired' }, 410);
      let input: { step?: string; outcome?: string; recordId?: string };
      try {
        const body = await request.text();
        if (new TextEncoder().encode(body).byteLength > 2048) return json({ error: 'validation_failed', fields: ['body'] }, 400);
        const parsed = JSON.parse(body) as unknown;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return json({ error: 'validation_failed', fields: ['body'] }, 400);
        }
        input = parsed as typeof input;
      } catch {
        return json({ error: 'validation_failed', fields: ['body'] }, 400);
      }
      const stepName = current.delivery_step.slice(0, -'_writing'.length);
      const allowedInput = new Set(['step', 'outcome', 'recordId']);
      if (Object.keys(input).some((key) => !allowedInput.has(key))
          || input.step !== stepName || !['present', 'absent'].includes(input.outcome ?? '')) {
        return json({ error: 'validation_failed', fields: ['step', 'outcome'] }, 400);
      }
      const now = new Date().toISOString();
      const photoStep = /^photo_([0-2])_(upload|file)$/.exec(stepName);
      if (photoStep) {
        const index = Number(photoStep[1]);
        const phase = photoStep[2];
        if (input.outcome === 'present' && !/^[A-Za-z0-9_-]{1,128}$/.test(input.recordId ?? '')) return json({ error: 'validation_failed', fields: ['recordId'] }, 400);
        const column = phase === 'upload' ? 'upload_id' : 'file_id';
        const result = await env.INTAKE_DB.batch([
          env.INTAKE_DB.prepare(`UPDATE intake_photos SET phase = ?1, ${column} = ?2, lease_until = NULL WHERE receipt_id = ?3 AND photo_index = ?4 AND phase = ?5`)
            .bind(input.outcome === 'present' ? `${phase}_created` : phase === 'upload' ? 'staged' : 'upload_created', input.outcome === 'present' ? input.recordId! : null, receiptId, index, `${phase}_writing`),
          env.INTAKE_DB.prepare("UPDATE intake_submissions SET delivery_step = 'job_created', state = 'delayed', delivery_lease_until = NULL, delivery_lease_token = NULL, error_category = 'reconciled', last_reconciled_at = ?1, last_operator_email = ?2 WHERE receipt_id = ?3 AND state = 'failed' AND delivery_step = ?4")
            .bind(now, email, receiptId, current.delivery_step),
        ]);
        if (result.some((item) => !item.success || item.meta?.changes !== 1)) return json({ error: 'reconciliation_conflict' }, 409);
        await env.INTAKE_QUEUE.send(receiptId);
        return json({ receiptId, state: 'delayed' }, 202);
      }
      const steps = {
        account: ['external_account_id', 'queued', 'account_created'],
        location: ['external_location_id', 'account_created', 'location_created'],
        contact: ['external_contact_id', 'location_created', 'contact_created'],
        job: ['external_job_id', 'contact_created', 'job_created'],
      } as const;
      const definition = steps[stepName as keyof typeof steps];
      if (!definition || (input.outcome === 'present' && !/^[A-Za-z0-9_-]{1,128}$/.test(input.recordId ?? ''))) {
        return json({ error: 'validation_failed', fields: ['recordId'] }, 400);
      }
      const [idColumn, absentStep, presentStep] = definition;
      const reconcileResult = input.outcome === 'present'
        ? await env.INTAKE_DB.prepare(
          `UPDATE intake_submissions SET ${idColumn} = ?1, delivery_step = ?2, state = 'delayed',
             delivery_lease_until = NULL, delivery_lease_token = NULL, error_category = 'reconciled',
             last_reconciled_at = ?3, last_operator_email = ?4, updated_at = ?3
           WHERE receipt_id = ?5 AND state = 'failed' AND delivery_step = ?6`,
        ).bind(input.recordId!, presentStep, now, email, receiptId, `${stepName}_writing`).run()
        : await env.INTAKE_DB.prepare(
          `UPDATE intake_submissions SET delivery_step = ?1, state = 'delayed', error_category = 'reconciled_absent',
             delivery_lease_until = NULL, delivery_lease_token = NULL, last_reconciled_at = ?2,
             last_operator_email = ?3, updated_at = ?2
           WHERE receipt_id = ?4 AND state = 'failed' AND delivery_step = ?5`,
        ).bind(absentStep, now, email, receiptId, `${stepName}_writing`).run();
      if (!reconcileResult.success) return json({ error: 'operator_unavailable' }, 503);
      if (reconcileResult.meta?.changes !== 1) return json({ error: 'reconciliation_conflict' }, 409);
      await env.INTAKE_QUEUE.send(receiptId);
      console.info(JSON.stringify({ event: 'intake_reconciled', step: stepName, outcome: input.outcome }));
      return json({ receiptId, state: 'delayed', reconciliation: input.outcome }, 202);
    }
    if (action || request.method !== 'GET') return new Response(null, { status: 405, headers: { ...noStoreHeaders, Allow: 'GET' } });
    const row = await env.INTAKE_DB.prepare(
      `SELECT receipt_id, state, created_at, updated_at, delivered_at, error_category, delivery_step, attempts
       FROM intake_submissions WHERE receipt_id = ?1`,
    ).bind(receiptId).first<Record<string, string | null>>();
    if (!row) return json({ error: 'not_found' }, 404);
    const bookings = await env.INTAKE_DB.prepare('SELECT phase FROM intake_bookings WHERE receipt_id = ?1').bind(receiptId).all<{ phase: string }>();
    const pendingBookings = await env.INTAKE_DB.prepare('SELECT error_category FROM calendar_booking_events WHERE receipt_id = ?1 AND delivered_at IS NULL').bind(receiptId).all<{ error_category: string | null }>();
    return json({
      receiptId: row.receipt_id,
      state: row.state,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deliveredAt: row.delivered_at,
      errorCategory: row.error_category,
      deliveryStep: row.delivery_step,
      attempts: row.attempts,
      checkedBy: email,
      bookingStates: bookings.results.map((booking) => booking.phase),
      pendingBookingErrors: pendingBookings.results.map((booking) => booking.error_category),
    });
  } catch {
    console.error(JSON.stringify({ event: 'intake_operator_operation_failed' }));
    return json({ error: 'operator_unavailable' }, 503);
  }
}

type DeliveryRow = {
  receipt_id: string;
  state: string;
  payload: string | null;
  delivery_step: string;
  delivery_lease_until: string | null;
  delivery_lease_token: string | null;
  external_account_id: string | null;
  external_location_id: string | null;
  external_contact_id: string | null;
  external_job_id: string | null;
};

async function updateDelivery(db: D1Database, receiptId: string, values: Record<string, string | number | null>): Promise<void> {
  const assignments = Object.keys(values).map((key) => `${key} = ?`).join(', ');
  const params = [...Object.values(values), new Date().toISOString(), receiptId];
  const result = await db.prepare(
    `UPDATE intake_submissions SET ${assignments}, updated_at = ? WHERE receipt_id = ?`,
  ).bind(...params).run();
  if (!result.success) throw new Error('ledger_write_failed');
}

async function jobTreadCall(grantKey: string, operation: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch('https://api.jobtread.com/pave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { $: { grantKey, notify: false, timeZone: 'America/Denver' }, ...operation } }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('jobtread_response_unknown');
  const result = await response.json() as Record<string, unknown>;
  if (result.errors || result.error) throw new Error('jobtread_response_unknown');
  return result;
}

async function deliverOne(receiptId: string, env: IntakeEnvironment): Promise<void> {
  if (!env.INTAKE_DB) throw new Error('ledger_unavailable');
  const db = env.INTAKE_DB;
  const row = await db.prepare(
    `SELECT receipt_id, state, payload, delivery_step, external_account_id,
            external_location_id, external_contact_id, external_job_id,
            delivery_lease_until, delivery_lease_token
     FROM intake_submissions WHERE receipt_id = ?1`,
  ).bind(receiptId).first<DeliveryRow>();
  if (!row || row.state === 'delivered' || !row.payload) return;
  if (!env.JOBTREAD_API_KEY || !env.JOBTREAD_ORGANIZATION_ID
      || !env.JOBTREAD_EMAIL_CUSTOM_FIELD_ID || !env.JOBTREAD_PHONE_CUSTOM_FIELD_ID) {
    await updateDelivery(db, receiptId, { state: 'delayed', error_category: 'delivery_not_configured' });
    throw new Error('delivery_not_configured');
  }
  if (row.delivery_step.endsWith('_writing')) {
    if (row.delivery_lease_until && Date.parse(row.delivery_lease_until) > Date.now()) return;
    await updateDelivery(db, receiptId, { state: 'failed', error_category: 'external_result_unknown' });
    return;
  }
  const payload = JSON.parse(row.payload) as Partial<ProjectPayload> & { name: string; message: string; leadType?: string };
  const alias = receiptId.replace(/-/g, '').slice(-8).toUpperCase();
  let leaseToken = '';
  const step = async (name: string) => {
    leaseToken = crypto.randomUUID();
    const now = new Date();
    const leaseUntil = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
    const result = await db.prepare(
      `UPDATE intake_submissions SET state = 'processing', delivery_step = ?1,
         delivery_lease_until = ?2, delivery_lease_token = ?3, error_category = NULL, updated_at = ?4
       WHERE receipt_id = ?5 AND delivery_step = ?6
         AND (delivery_lease_until IS NULL OR delivery_lease_until <= ?4)`,
    ).bind(`${name}_writing`, leaseUntil, leaseToken, now.toISOString(), receiptId, row.delivery_step).run();
    if (!result.success || result.meta?.changes !== 1) throw new Error('delivery_claimed');
  };
  if (!row.external_account_id) {
    await step('account');
    const result = await jobTreadCall(env.JOBTREAD_API_KEY, {
      createAccount: {
        $: { organizationId: env.JOBTREAD_ORGANIZATION_ID, name: `${payload.name} [MR05-${alias}]`, type: 'customer', notify: false },
        createdAccount: { id: {}, name: {}, organization: { id: {} } },
      },
    });
    const id = (((result.createAccount as Record<string, unknown> | undefined)?.createdAccount as Record<string, unknown> | undefined)?.id);
    if (typeof id !== 'string') throw new Error('jobtread_response_unknown');
    const saved = await db.prepare(
      `UPDATE intake_submissions SET delivery_step = 'account_created', external_account_id = ?1,
         delivery_lease_until = NULL, delivery_lease_token = NULL, updated_at = ?2
       WHERE receipt_id = ?3 AND delivery_lease_token = ?4`,
    ).bind(id, new Date().toISOString(), receiptId, leaseToken).run();
    if (!saved.success || saved.meta?.changes !== 1) throw new Error('ledger_write_failed');
    row.external_account_id = id;
    row.delivery_step = 'account_created';
  }
  if (!row.external_location_id) {
    const accountRead = await jobTreadCall(env.JOBTREAD_API_KEY, { account: { $: { id: row.external_account_id }, id: {}, name: {}, organization: { id: {} } } });
    const account = accountRead.account as { id?: string; name?: string; organization?: { id?: string } };
    if (account?.id !== row.external_account_id || account.name !== `${payload.name} [MR05-${alias}]` || account.organization?.id !== env.JOBTREAD_ORGANIZATION_ID) throw new Error('jobtread_readback_failed');
    await step('location');
    const result = await jobTreadCall(env.JOBTREAD_API_KEY, {
      createLocation: {
        $: { accountId: row.external_account_id, name: payload.project ? `${payload.project.location} ${alias}` : `General inquiry ${alias}`, parseAddress: false },
        createdLocation: { id: {}, account: { id: {} } },
      },
    });
    const id = (((result.createLocation as Record<string, unknown> | undefined)?.createdLocation as Record<string, unknown> | undefined)?.id);
    if (typeof id !== 'string') throw new Error('jobtread_response_unknown');
    const saved = await db.prepare(
      `UPDATE intake_submissions SET delivery_step = 'location_created', external_location_id = ?1,
         delivery_lease_until = NULL, delivery_lease_token = NULL, updated_at = ?2
       WHERE receipt_id = ?3 AND delivery_lease_token = ?4`,
    ).bind(id, new Date().toISOString(), receiptId, leaseToken).run();
    if (!saved.success || saved.meta?.changes !== 1) throw new Error('ledger_write_failed');
    row.external_location_id = id;
    row.delivery_step = 'location_created';
  }
  if (!row.external_contact_id) {
    const locationRead = await jobTreadCall(env.JOBTREAD_API_KEY, { location: { $: { id: row.external_location_id }, id: {}, name: {}, account: { id: {}, organization: { id: {} } } } });
    const location = locationRead.location as { id?: string; name?: string; account?: { id?: string; organization?: { id?: string } } };
    if (location?.id !== row.external_location_id || location.account?.id !== row.external_account_id || location.account.organization?.id !== env.JOBTREAD_ORGANIZATION_ID
      || location.name !== (payload.project ? `${payload.project.location} ${alias}` : `General inquiry ${alias}`)) throw new Error('jobtread_readback_failed');
    await step('contact');
    const contactFields = { ...(payload.email ? { [env.JOBTREAD_EMAIL_CUSTOM_FIELD_ID]: payload.email } : {}), ...(payload.phone ? { [env.JOBTREAD_PHONE_CUSTOM_FIELD_ID]: payload.phone } : {}) };
    const result = await jobTreadCall(env.JOBTREAD_API_KEY, {
      createContact: {
        $: { accountId: row.external_account_id, name: payload.name, customFieldValues: contactFields },
        createdContact: { id: {}, account: { id: {} }, name: {} },
      },
    });
    const id = (((result.createContact as Record<string, unknown> | undefined)?.createdContact as Record<string, unknown> | undefined)?.id);
    if (typeof id !== 'string') throw new Error('jobtread_response_unknown');
    const saved = await db.prepare(
      `UPDATE intake_submissions SET delivery_step = 'contact_created', external_contact_id = ?1,
         delivery_lease_until = NULL, delivery_lease_token = NULL, updated_at = ?2
       WHERE receipt_id = ?3 AND delivery_lease_token = ?4`,
    ).bind(id, new Date().toISOString(), receiptId, leaseToken).run();
    if (!saved.success || saved.meta?.changes !== 1) throw new Error('ledger_write_failed');
    row.external_contact_id = id;
    row.delivery_step = 'contact_created';
  }
  if (!row.external_job_id) {
    await step('job');
    const result = await jobTreadCall(env.JOBTREAD_API_KEY, {
      createJob: {
        $: { locationId: row.external_location_id, name: `${payload.leadType === 'lead_magnet' ? 'Cost guide' : payload.project ? 'Project' : 'Inquiry'} ${alias}`, description: payload.message },
        createdJob: { id: {}, name: {}, location: { id: {}, account: { id: {} } } },
      },
    });
    const job = (result.createJob as Record<string, unknown> | undefined)?.createdJob as Record<string, unknown> | undefined;
    const id = job?.id;
    const jobLocation = job?.location as Record<string, unknown> | undefined;
    const jobAccount = jobLocation?.account as Record<string, unknown> | undefined;
    if (typeof id !== 'string' || jobLocation?.id !== row.external_location_id || jobAccount?.id !== row.external_account_id) throw new Error('jobtread_readback_failed');
    const saved = await db.prepare(
      `UPDATE intake_submissions SET delivery_step = 'job_created', external_job_id = ?1,
         delivery_lease_until = NULL, delivery_lease_token = NULL, updated_at = ?2
       WHERE receipt_id = ?3 AND delivery_lease_token = ?4`,
    ).bind(id, new Date().toISOString(), receiptId, leaseToken).run();
    if (!saved.success || saved.meta?.changes !== 1) throw new Error('ledger_write_failed');
    row.external_job_id = id;
    row.delivery_step = 'job_created';
  }
  const expectedFieldId = payload.email
    ? env.JOBTREAD_EMAIL_CUSTOM_FIELD_ID
    : env.JOBTREAD_PHONE_CUSTOM_FIELD_ID;
  const expectedContactValue = payload.email ?? payload.phone ?? '';
  const readback = await jobTreadCall(env.JOBTREAD_API_KEY, {
    contact: {
      $: { id: row.external_contact_id },
      id: {},
      account: { id: {} },
      customFieldValues: { $: { size: 100 }, nextPage: {}, nodes: { customField: { id: {} }, value: {} } },
    },
    job: {
      $: { id: row.external_job_id },
      id: {},
      name: {}, description: {},
      location: { id: {}, account: { id: {} } },
    },
  });
  const contact = readback.contact as Record<string, unknown> | undefined;
  const contactAccount = contact?.account as Record<string, unknown> | undefined;
  const contactValues = contact?.customFieldValues as { nextPage?: string; nodes?: { customField?: { id?: string }; value?: unknown }[] } | undefined;
  let page = contactValues?.nextPage;
  const seenPages = new Set<string>();
  while (page) {
    if (seenPages.has(page) || seenPages.size >= 10) throw new Error('jobtread_readback_failed');
    seenPages.add(page);
    const result = await jobTreadCall(env.JOBTREAD_API_KEY, { contact: { $: { id: row.external_contact_id }, customFieldValues: {
      $: { size: 100, page }, nextPage: {}, nodes: { customField: { id: {} }, value: {} },
    } } });
    const values = (result.contact as { customFieldValues?: typeof contactValues })?.customFieldValues;
    if (!values?.nodes) throw new Error('jobtread_readback_failed');
    contactValues!.nodes = [...(contactValues!.nodes ?? []), ...values.nodes];
    page = values.nextPage;
  }
  const matchedContactField = contactValues?.nodes?.some((node) =>
    node.customField?.id === expectedFieldId && node.value === expectedContactValue);
  const readJob = readback.job as Record<string, unknown> | undefined;
  const readLocation = readJob?.location as Record<string, unknown> | undefined;
  const readAccount = readLocation?.account as Record<string, unknown> | undefined;
  if (contact?.id !== row.external_contact_id || contactAccount?.id !== row.external_account_id
      || !matchedContactField || readJob?.id !== row.external_job_id
      || readLocation?.id !== row.external_location_id || readAccount?.id !== row.external_account_id
      || readJob?.description !== payload.message) {
    await updateDelivery(db, receiptId, { state: 'failed', error_category: 'jobtread_readback_failed' });
    console.error(JSON.stringify({ event: 'intake_delivery_readback_failed', count: 1 }));
    return;
  }
  if (payload.photos?.length) {
    if (!env.INTAKE_PHOTOS) throw new Error('photo_delivery_not_configured');
    try {
      await deliverPhotos(receiptId, row.external_job_id!, payload.photos, {
        INTAKE_DB: db, INTAKE_PHOTOS: env.INTAKE_PHOTOS, JOBTREAD_ORGANIZATION_ID: env.JOBTREAD_ORGANIZATION_ID,
        JOBTREAD_TRANSFER_ORIGINS: env.JOBTREAD_TRANSFER_ORIGINS, JOBTREAD_API_KEY: env.JOBTREAD_API_KEY!,
      }, (operation) => jobTreadCall(env.JOBTREAD_API_KEY!, operation));
    } catch (error) {
      if (error instanceof Error && error.message === 'photo_claimed') return;
      const photoState = await db.prepare('SELECT photo_index, phase FROM intake_photos WHERE receipt_id = ?1 AND phase LIKE ?2 LIMIT 1').bind(receiptId, '%_writing').first<{ photo_index: number; phase: string }>();
      if (photoState) {
        await updateDelivery(db, receiptId, { state: 'failed', error_category: 'external_result_unknown', delivery_step: `photo_${photoState.photo_index}_${photoState.phase}` });
        return;
      }
      throw error;
    }
  }
  const now = new Date();
  await updateDelivery(db, receiptId, {
    state: 'delivered', delivery_step: 'verified', delivered_at: now.toISOString(),
    payload_expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_lease_until: null, delivery_lease_token: null, error_category: null,
  });
}

async function consumeQueue(batch: MessageBatch<string>, env: IntakeEnvironment): Promise<void> {
  for (const message of batch.messages) {
    try {
      if (env.INTAKE_DB) {
        await env.INTAKE_DB.prepare(
          'UPDATE intake_submissions SET attempts = attempts + 1, updated_at = ?1 WHERE receipt_id = ?2',
        ).bind(new Date().toISOString(), message.body).run();
      }
      await deliverOne(message.body, env);
      message.ack();
    } catch (error) {
      // Only constant diagnostic codes are logged; never raw vendor responses,
      // payloads, signed transfer URLs, or exception text containing user data.
      const category = error instanceof Error && /^[a-z_]{1,80}(?:_\d{3})?$/.test(error.message) ? error.message : 'delivery_failed';
      console.error(JSON.stringify({ event: 'intake_delivery_retry', category }));
      if (error instanceof Error && error.message === 'delivery_claimed') {
        message.ack();
        continue;
      }
      if (env.INTAKE_DB) {
        try {
          const row = await env.INTAKE_DB.prepare(
            'SELECT delivery_step, delivery_lease_until FROM intake_submissions WHERE receipt_id = ?1',
          ).bind(message.body).first<{ delivery_step: string; delivery_lease_until: string | null }>();
          if (row?.delivery_step.endsWith('_writing')) {
            if (row.delivery_lease_until && Date.parse(row.delivery_lease_until) > Date.now()) {
              await updateDelivery(env.INTAKE_DB, message.body, { state: 'failed', error_category: 'external_result_unknown' });
              console.error(JSON.stringify({ event: 'intake_delivery_ambiguous', count: 1 }));
              message.ack();
              continue;
            }
            await updateDelivery(env.INTAKE_DB, message.body, { state: 'failed', error_category: 'external_result_unknown' });
            console.error(JSON.stringify({ event: 'intake_delivery_ambiguous', count: 1 }));
            message.ack();
            continue;
          }
        } catch {
          // Leave the message for Cloudflare's bounded retry and dead-letter policy.
        }
      }
      message.retry();
    }
  }
}

async function consumeDeadLetters(batch: MessageBatch<string>, env: IntakeEnvironment): Promise<void> {
  if (!env.INTAKE_DB) {
    for (const message of batch.messages) message.retry();
    return;
  }
  for (const message of batch.messages) {
    try {
      const result = await env.INTAKE_DB.prepare(
        `UPDATE intake_submissions SET state = 'failed',
           error_category = CASE WHEN delivery_step LIKE '%_writing' THEN 'external_result_unknown' ELSE 'delivery_dead_lettered' END,
           updated_at = ?1 WHERE receipt_id = ?2 AND state != 'delivered'`,
      ).bind(new Date().toISOString(), message.body).run();
      if (!result.success) {
        console.error(JSON.stringify({ event: 'intake_dead_letter_processing_failed', count: 1 }));
        message.retry();
        continue;
      }
      console.error(JSON.stringify({ event: 'intake_dead_letter', count: 1 }));
      message.ack();
    } catch {
      console.error(JSON.stringify({ event: 'intake_dead_letter_processing_failed', count: 1 }));
      message.retry();
    }
  }
}

async function cleanupExpired(env: IntakeEnvironment): Promise<void> {
  if (!env.INTAKE_DB) return;
  const now = new Date().toISOString();
  try {
    await env.INTAKE_DB.prepare("DELETE FROM integration_state WHERE name LIKE 'google-oauth-%' AND json_extract(value, '$.expires') <= ?1").bind(Date.now()).run();
    if (env.INTAKE_PHOTOS) {
      const expired = await env.INTAKE_DB.prepare('SELECT payload FROM intake_submissions WHERE payload IS NOT NULL AND payload_expires_at <= ?1 LIMIT 100').bind(now).all<{ payload: string }>();
      for (const row of expired.results) {
        const payload = JSON.parse(row.payload) as Partial<ProjectPayload>;
        for (const photo of payload.photos ?? []) await env.INTAKE_PHOTOS.delete(photo.key);
      }
      // Staging can succeed before the ledger transaction fails. Sweep those orphan bytes too.
      let cursor: string | undefined;
      do {
        const objects = await env.INTAKE_PHOTOS.list({ prefix: 'intake/', cursor, limit: 1000 });
        const expiredKeys = objects.objects.filter((object) => Date.now() - object.uploaded.getTime() >= 30 * 86400_000).map((object) => object.key);
        if (expiredKeys.length) await env.INTAKE_PHOTOS.delete(expiredKeys);
        cursor = objects.truncated ? objects.cursor : undefined;
      } while (cursor);
    }
    const payload = await env.INTAKE_DB.prepare(
    `UPDATE intake_submissions SET payload = NULL, state = CASE WHEN state = 'delivered' THEN state ELSE 'failed' END,
       error_category = CASE WHEN state = 'delivered' THEN error_category ELSE 'retention_expired' END,
       updated_at = ?1 WHERE payload IS NOT NULL AND payload_expires_at <= ?1`,
    ).bind(now).run();
    if (!payload.success) throw new Error('cleanup_failed');
    const expiredCount = payload.meta?.changes ?? 0;
    if (expiredCount > 0) console.warn(JSON.stringify({ event: 'intake_retention_expired', count: expiredCount }));
    const metadata = await env.INTAKE_DB.prepare(
      `DELETE FROM intake_submissions WHERE payload IS NULL AND metadata_expires_at <= ?1`,
    ).bind(now).run();
    if (!metadata.success) throw new Error('cleanup_failed');
    const expiredLeases = await env.INTAKE_DB.prepare(
      `UPDATE intake_submissions SET state = 'failed', error_category = 'external_result_unknown',
         updated_at = ?1 WHERE state = 'processing' AND delivery_step LIKE '%_writing'
         AND delivery_lease_until <= ?1`,
    ).bind(now).run();
    if (!expiredLeases.success) throw new Error('cleanup_failed');
    const pendingStats = await env.INTAKE_DB.prepare(
      `SELECT COUNT(*) AS count, MIN(created_at) AS oldest FROM intake_submissions
       WHERE state IN ('accepted', 'delayed') AND payload IS NOT NULL`,
    ).first<{ count: number; oldest: string | null }>();
    if (pendingStats?.oldest && Date.now() - Date.parse(pendingStats.oldest) >= 24 * 60 * 60 * 1000) {
      console.warn(JSON.stringify({ event: 'intake_pending_over_24h', count: pendingStats.count, oldestPendingAt: pendingStats.oldest }));
    }
    const requeueBefore = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const pending = await env.INTAKE_DB.prepare(
      `SELECT receipt_id FROM intake_submissions
       WHERE payload IS NOT NULL AND (state = 'accepted' OR (state = 'delayed' AND updated_at <= ?1))
       ORDER BY created_at ASC LIMIT 100`,
    ).bind(requeueBefore).all<{ receipt_id: string }>();
    if (pending.results.length && env.INTAKE_QUEUE) {
      for (const item of pending.results) {
        try {
          await env.INTAKE_QUEUE.send(item.receipt_id);
        } catch {
          console.warn(JSON.stringify({ event: 'intake_requeue_failed', count: 1 }));
          break;
        }
      }
    }
  } catch {
    console.warn(JSON.stringify({ event: 'intake_cleanup_failed' }));
    throw new Error('intake_cleanup_failed');
  }
}

export default {
  async fetch(request: Request, env: IntakeEnvironment = {}): Promise<Response> {
    const path = new URL(request.url).pathname;
    if(path==='/conversion/job-completed'){
      if(request.method!=='POST')return json({error:'method_not_allowed'},405);
      // Secret is a header, never a URL; completion and contact ownership are read back from JobTread.
      if(!env.CONVERSION_WEBHOOK_SECRET || request.headers.get('Authorization')!==`Bearer ${env.CONVERSION_WEBHOOK_SECRET}`)return json({error:'unauthorized'},401);
      const raw=await request.text();if(raw.length>500)return json({error:'validation_failed'},400);
      try{const input=JSON.parse(raw);if(typeof input?.jobId!=='string'||typeof input.contactId!=='string')return json({error:'validation_failed'},400);
        if(!env.JOBTREAD_API_KEY)return json({error:'delivery_not_configured'},503);
        return json(await captureCompletedJob(env,op=>jobTreadCall(env.JOBTREAD_API_KEY!,op),input.jobId,input.contactId));
      }catch{return json({error:'completion_not_confirmed'},409);}
    }
    if (path === '/intake/contact' || path === '/intake/project' || path === '/intake/lead-magnet' || path === '/conversion/public') {
      const origin = request.headers.get('Origin');
      const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean);
      if (origin && !allowed.includes(origin)) return json({ error: 'origin_not_allowed' }, 403);
      if (request.method === 'OPTIONS') {
        if (!origin) return json({ error: 'origin_not_allowed' }, 403);
        return new Response(null, { status: 204, headers: { ...noStoreHeaders,
          'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key', 'Access-Control-Max-Age': '600' } });
      }
      let response: Response;
      try { response = path === '/conversion/public' ? await conversionPublic(request,env) : await acceptInquiry(request, env, path === '/intake/project', path === '/intake/lead-magnet'); }
      catch { response = json({error:'conversion_unavailable'},503); }
      if (origin) { response.headers.set('Access-Control-Allow-Origin', origin); response.headers.set('Vary', 'Origin'); }
      return response;
    }
    if (path.startsWith('/conversion/')) {
      const origin=request.headers.get('Origin');
      if(origin && !(env.ALLOWED_ORIGINS??'').split(',').map(v=>v.trim()).includes(origin) && origin!==new URL(request.url).origin)return json({error:'origin_not_allowed'},403);
      try { const response=await conversionPublic(request,env);if(origin){response.headers.set('Access-Control-Allow-Origin',origin);response.headers.set('Vary','Origin');}return response; } catch { return json({error:'conversion_unavailable'},503); }
    }
    if (path === '/operator' || path.startsWith('/operator/')) return operatorRoute(request, env, path);
    if (path !== '/' && path !== '/health') return json({ error: 'not_found' }, 404);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { ...noStoreHeaders, Allow: 'GET, HEAD' } });
    }
    const response = Response.json({ status: 'ok', service: 'miller-remodeling-intake', stage: 'scaffold' }, {
      headers: noStoreHeaders,
    });
    return request.method === 'HEAD' ? new Response(null, response) : response;
  },
  async queue(batch: MessageBatch<string>, env: IntakeEnvironment): Promise<void> {
    if (batch.queue === 'miller-intake-dead-letter') await consumeDeadLetters(batch, env);
    else await consumeQueue(batch, env);
  },
  async scheduled(_controller: ScheduledController, env: IntakeEnvironment): Promise<void> {
    if (!_controller.cron || _controller.cron === '0 * * * *') {
      if(env.INTAKE_DB && env.CONVERSION_ENABLED!==undefined)await cleanupConversion(env.INTAKE_DB);
      await cleanupExpired(env);
    }
    await syncCalendar(env, (operation) => {
      if (!env.JOBTREAD_API_KEY) throw new Error('delivery_not_configured');
      return jobTreadCall(env.JOBTREAD_API_KEY, operation);
    });
    try { await runConversion(env, (operation) => {
      if (!env.JOBTREAD_API_KEY) throw new Error('delivery_not_configured');
      return jobTreadCall(env.JOBTREAD_API_KEY,operation);
    }); } catch { console.warn(JSON.stringify({event:'conversion_processing_failed'})); }
  },
};
