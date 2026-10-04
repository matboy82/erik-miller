export type Photo = { key: string; type: string; size: number; sha256: string };
export type Project = {
  projectType: string; location: string; timeline: string; budget: string;
  description: string; experience: string; referralSource: string;
};
export type ProjectPayload = {
  name: string; email?: string; phone?: string; message: string;
  project: Project; fit: 'needs-review'; photos: Photo[];
};

const fields = ['projectType', 'location', 'timeline', 'budget', 'description', 'experience', 'referralSource'] as const;
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const MAX_PROJECT_BYTES = 9 * 1024 * 1024;

export async function decodeProject(input: Record<string, unknown>, submissionKey: string): Promise<{
  project: Project; photos: Photo[]; uploads: { key: string; bytes: Uint8Array; type: string }[]; message: string;
}> {
  if (!input.project || typeof input.project !== 'object' || Array.isArray(input.project)) throw new Error('project');
  const value = input.project as Record<string, unknown>;
  if (Object.keys(value).some((key) => !fields.includes(key as typeof fields[number]))) throw new Error('project');
  const project = {} as Project;
  for (const field of fields) {
    const text = value[field];
    if (typeof text !== 'string' || !text.trim() || text.length > (field === 'description' ? 5000 : 200)) throw new Error(field);
    project[field] = text.trim();
  }
  const photos: Photo[] = [];
  const uploads: { key: string; bytes: Uint8Array; type: string }[] = [];
  if (input.photos !== undefined && !Array.isArray(input.photos)) throw new Error('photos');
  const incoming = (input.photos ?? []) as unknown[];
  if (incoming.length > 3) throw new Error('photos');
  for (const [index, raw] of incoming.entries()) {
    if (!raw || typeof raw !== 'object') throw new Error('photos');
    const photo = raw as Record<string, unknown>;
    if (Object.keys(photo).some((key) => key !== 'type' && key !== 'data')
      || typeof photo.type !== 'string' || !extensions[photo.type] || typeof photo.data !== 'string'
      || photo.data.length > 2_800_000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(photo.data)) throw new Error('photos');
    const bytes = Uint8Array.from(atob(photo.data), (character) => character.charCodeAt(0));
    if (!bytes.length || bytes.length > 2 * 1024 * 1024 || !isImage(bytes, photo.type)) throw new Error('photos');
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const sha256 = Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
    const key = `intake/${submissionKey}/${index}-${sha256}.${extensions[photo.type]}`;
    photos.push({ key, type: photo.type, size: bytes.length, sha256 });
    uploads.push({ key, bytes, type: photo.type });
  }
  const message = ['Website project inquiry', 'Fit: Needs Erik’s review', ...fields.map((field) => `${field}: ${project[field]}`)].join('\n\n');
  return { project, photos, uploads, message };
}

export function isImage(bytes: Uint8Array, type: string): boolean {
  if (type === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === 'image/png') return [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  return type === 'image/webp' && new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF'
    && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
}
