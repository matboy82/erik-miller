import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, readdirSync } from 'node:fs';
import { isAbsolute, resolve, sep } from 'node:path';
import { z } from 'astro/zod';
import sharp from 'sharp';

// Changed only in the disposable fixture's copied source, never through environment inputs.
const verificationOnly = false;
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const text = z.string().trim().min(1).refine((value) => !/[<>]/u.test(value) && [...value].every((character) => character.charCodeAt(0) >= 32), 'Plain text required');
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);
export const projectSchema = z.object({
  id: z.literal('representative'), title: text, paragraphs: z.array(text).min(1),
  image: z.object({ path: text, alt: text, width: z.number().int().positive(), height: z.number().int().positive(), sha256: hash }).strict(),
  origin: z.enum(['stock', 'miller']), status: z.enum(['draft', 'approved']),
  source: z.string().url(), creator: text, permission: text, permissionEvidence: text,
  owner: text, substituteId: z.string().regex(/^CONTENT-SUB-\d{2}$/), substituteEvidence: text,
  credit: text.optional(),
  approval: z.object({ approvedBy: z.literal('Erik Miller'), approvedOn: date, evidence: text }).strict().optional(),
}).strict().superRefine((record, context) => {
  if (record.origin === 'stock' && (record.status !== 'draft' || record.approval)) context.addIssue({ code: 'custom', message: 'Stock must remain Draft without approval' });
  if (record.status === 'approved' && !record.approval) context.addIssue({ code: 'custom', message: 'Approved Miller content requires sign-off' });
  if (record.status === 'draft' && record.approval) context.addIssue({ code: 'custom', message: 'Draft content cannot carry approval' });
});

export function contentCopyHash(record) {
  return sha256(JSON.stringify({ title: record.title, alt: record.image.alt, paragraphs: record.paragraphs }));
}

export function contentFile(root, name, boundary) {
  if (typeof name !== 'string' || isAbsolute(name) || name.includes('\\') || name.split('/').some((part) => part === '..' || part === '.' || part === '')) throw Error('Invalid content path');
  const repository = realpathSync(root);
  const directory = realpathSync(resolve(root, boundary));
  const target = realpathSync(resolve(root, name));
  if (!directory.startsWith(repository + sep) || !target.startsWith(directory + sep)) throw Error('Content path escapes its boundary');
  return target;
}

function evidenceBlock(root, name, kind, boundary) {
  const contents = readFileSync(contentFile(root, name, boundary), 'utf8');
  if (!contents.trim()) throw Error('Empty content evidence');
  const blocks = [...contents.matchAll(new RegExp('^```' + kind + '\\s*\\n([\\s\\S]*?)^```\\s*$', 'gm'))];
  if (blocks.length !== 1) throw Error(`Expected one ${kind} evidence block`);
  return { contents, data: JSON.parse(blocks[0][1]) };
}

export function placeholderStatuses(root) {
  if (realpathSync(resolve(root, 'PLACEHOLDERS.md')) !== resolve(realpathSync(root), 'PLACEHOLDERS.md')) throw Error('Placeholder register escapes its canonical path');
  const register = readFileSync(resolve(root, 'PLACEHOLDERS.md'), 'utf8');
  const statuses = new Map();
  for (const rawLine of register.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line.startsWith('|') || /^\|\s*(ID\s*\||-)/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 5 || !/^[A-Z]+(?:-[A-Z]+)*-\d{2}$/.test(cells[0]) || !['Open', 'Closed'].includes(cells[4]) || statuses.has(cells[0])) throw Error('Malformed placeholder register row');
    statuses.set(cells[0], cells[4]);
  }
  for (const id of ['INFRA-01', 'INFRA-02', 'BRAND-01', 'CONTENT-01', 'CRM-01', 'SCHED-01', 'DESIGN-01', 'ANALYTICS-01', 'NOTIFY-01', 'RELEASE-01']) {
    if (!statuses.has(id)) throw Error(`Missing root placeholder ${id}`);
  }
  return { register, statuses };
}

export async function readProjectContent(root, env = process.env) {
  const mode = env.SITE_BUILD ?? 'review';
  if (!['review', 'production'].includes(mode) || ['PROJECT_CONTENT_PATH', 'PLACEHOLDER_PATH', 'CONTENT_APPROVAL', 'CONTENT_FIXTURE'].some((key) => env[key] !== undefined)) throw Error('Content mode/path overrides are forbidden');
  const records = readdirSync(resolve(root, 'apps/web/src/content/projects'));
  if (records.length !== 1 || records[0] !== 'representative.json') throw Error('Expected only the required representative project record');
  let record;
  try { record = projectSchema.parse(JSON.parse(readFileSync(contentFile(root, 'apps/web/src/content/projects/representative.json', 'apps/web/src/content/projects'), 'utf8'))); }
  catch { throw Error('Invalid representative project record'); }
  const imagePath = contentFile(root, record.image.path, 'apps/web/src/assets/projects');
  if (!/\.(jpg|jpeg|png|webp)$/.test(imagePath)) throw Error('Unsupported project image format');
  const bytes = readFileSync(imagePath);
  const metadata = await sharp(bytes).metadata();
  if (metadata.width !== record.image.width || metadata.height !== record.image.height || sha256(bytes) !== record.image.sha256 || metadata.orientation && metadata.orientation !== 1) throw Error('Project image dimensions/hash mismatch');
  if (metadata.exif || metadata.iptc || metadata.xmp) throw Error('Strip private image metadata before use');
  const permission = readFileSync(contentFile(root, record.permissionEvidence, 'docs/content'), 'utf8');
  if (!permission.trim() || !permission.includes(record.permission)) throw Error('Missing permission evidence');
  const { contents, data } = evidenceBlock(root, record.substituteEvidence, 'content-substitute', 'docs/content/substitutes');
  if (data.id !== record.substituteId || !['Open', 'Closed'].includes(data.status) || data.owner !== record.owner || !data.unblockCondition?.trim()) throw Error('Invalid substitute evidence');
  const { register, statuses } = placeholderStatuses(root);
  if (!register.includes(`](${record.substituteEvidence})`) || statuses.get(record.substituteId) !== data.status) throw Error('Substitute must be linked with matching root status');
  if (record.origin === 'miller') {
    for (const name of readdirSync(resolve(root, 'docs/content/substitutes'))) {
      if (!name.endsWith('.md')) continue;
      const archived = evidenceBlock(root, 'docs/content/substitutes/' + name, 'content-substitute', 'docs/content/substitutes').data;
      if (archived.origin === 'stock' && archived.imageSha256 === record.image.sha256) throw Error('A stock substitute image cannot be relabeled as Miller work');
    }
  }
  if (record.status === 'draft') {
    if (data.status !== 'Open' || data.imageSha256 !== record.image.sha256 || data.copySha256 !== contentCopyHash(record) || data.source !== record.source || data.creator !== record.creator || data.permission !== record.permission || !data.retrievedOn) throw Error('Draft substitute provenance does not match its content');
  } else {
    const { contents: signOff, data: approval } = evidenceBlock(root, record.approval.evidence, 'content-approval', 'docs/content/approvals');
    const expected = { recordId: record.id, imageSha256: record.image.sha256, copySha256: contentCopyHash(record), approvedBy: record.approval.approvedBy, approvedOn: record.approval.approvedOn };
    if (Object.keys(approval).some((key) => !Object.hasOwn(expected, key) && key !== 'verificationOnly') || !Object.entries(expected).every(([key, value]) => approval[key] === value)) throw Error('Content approval is stale or inconsistent');
    if (!verificationOnly && (approval.verificationOnly || /VERIFICATION ONLY|\*\*Verification only\*\*: true/i.test(signOff + contents + permission))) throw Error('Synthetic content evidence cannot approve canonical production');
    if (!contents.includes(record.approval.evidence) || !contents.includes(record.image.sha256) || !contents.includes(contentCopyHash(record))) throw Error('Replacement evidence must identify approved content');
    if (mode === 'production' && data.status !== 'Closed') throw Error(`Unresolved substitute ${record.substituteId}`);
  }
  if (mode === 'production') {
    if (record.origin !== 'miller' || record.status !== 'approved') throw Error(`Unresolved stock/Draft project ${record.id}`);
    for (const [id, status] of statuses) if (status !== 'Closed') throw Error(`Open root placeholder ${id}`);
  }
  return { ...record, stockLabel: record.origin === 'stock' ? 'Development stock photo — not Miller Remodeling work' : '', draftLabel: record.status === 'draft' ? 'Draft example writeup' : '' };
}
