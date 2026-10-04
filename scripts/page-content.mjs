import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { isAbsolute, resolve, sep } from 'node:path';
import { z } from 'astro/zod';

// Only the disposable production-isolation fixture changes this constant.
const verificationOnly = false;
const plainText = z.string().trim().min(1).refine((value) => !/[<>]/u.test(value) && [...value].every((character) => character.charCodeAt(0) >= 32), 'Plain text required');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, 'Valid ISO date required');
const route = (kind, path) => ({ kind, path });
export const requiredPages = Object.freeze({
  home: route('home', '/'), kitchen: route('service', '/kitchen-remodeling/'),
  bathroom: route('service', '/bathroom-remodeling/'), 'whole-home': route('service', '/whole-home-remodeling/'),
  additions: route('service', '/additions/'), adu: route('service', '/adu-mother-in-law/'),
  'home-repair': route('service', '/home-repair/'), process: route('information', '/about-process/'),
  portfolio: route('portfolio', '/portfolio/'), contact: route('contact', '/contact/'),
  eagle: route('area', '/service-areas/eagle/'), star: route('area', '/service-areas/star/'),
  meridian: route('area', '/service-areas/meridian/'), boise: route('area', '/service-areas/boise/'),
  middleton: route('area', '/service-areas/middleton/'), kuna: route('area', '/service-areas/kuna/'),
});

const actionSchema = z.object({ label: plainText, href: z.string().regex(/^(?:\/[a-z0-9/-]*|tel:\+[0-9]{8,15})$/) }).strict();
const sectionSchema = z.object({ heading: plainText, paragraphs: z.array(plainText).min(1) }).strict();
export const pageSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/), kind: z.enum(['home', 'service', 'information', 'portfolio', 'contact', 'area']),
  path: z.string().regex(/^\/(?:[a-z0-9-]+\/)*$/), title: plainText, description: plainText,
  heading: plainText, intro: plainText, sections: z.array(sectionSchema).min(1),
  processSteps: z.array(plainText).length(5).optional(), primaryAction: actionSchema, secondaryAction: actionSchema.optional(),
  sources: z.array(z.enum(['mr06-story', 'mr06-spec', 'branding-kit'])).min(1),
  status: z.enum(['draft', 'approved']), draftReason: plainText.optional(),
  approval: z.object({ approvedBy: z.literal('Erik Miller'), approvedOn: isoDate, evidence: plainText, contentSha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict().optional(),
  faqs: z.array(z.object({ question: plainText, answer: plainText }).strict()).min(1).optional(),
}).strict().superRefine((page, context) => {
  if (page.status === 'draft' && (!page.draftReason || page.approval)) context.addIssue({ code: 'custom', message: 'Draft pages require a reason and cannot carry approval' });
  if (page.status === 'approved' && (!page.approval || page.draftReason)) context.addIssue({ code: 'custom', message: 'Approved pages require exact approval and cannot retain a Draft reason' });
});

export function pageContentHash(page) {
  const { status, draftReason, approval, ...content } = page;
  void status; void draftReason; void approval;
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

export function staticPagePath(page) {
  if (!page || !page.path || page.id === 'home') throw Error('A non-home page record is required for a static route');
  return { params: { slug: page.path.replace(/^\//, '').replace(/\/$/, '') }, props: { page } };
}

function safeFile(root, name) {
  if (isAbsolute(name) || name.includes('\\') || name.split('/').some((part) => part === '..' || part === '.' || !part)) throw Error('Invalid page approval path');
  const repository = resolve(root);
  const base = resolve(repository, 'docs/content/approvals');
  const target = resolve(repository, name);
  if (!base.startsWith(repository + sep) || !target.startsWith(base + sep)) throw Error('Page approval path escapes docs/content/approvals');
  const realBase = realpathSync(base);
  const realTarget = realpathSync(target);
  if (!realTarget.startsWith(realBase + sep)) throw Error('Page approval path escapes docs/content/approvals');
  return realTarget;
}

function verifyPageApproval(root, page) {
  const actualHash = pageContentHash(page);
  if (page.approval.contentSha256 !== actualHash) throw Error(`Page ${page.id} approval hash is stale`);
  const file = safeFile(root, page.approval.evidence);
  const contents = readFileSync(file, 'utf8');
  const matches = [...contents.matchAll(/^```page-approval\s*\n([\s\S]*?)^```\s*$/gm)];
  if (matches.length !== 1) throw Error(`Page ${page.id} requires one page-approval evidence block`);
  let evidence;
  try { evidence = JSON.parse(matches[0][1]); } catch { throw Error(`Invalid page approval evidence for ${page.id}`); }
  const expected = { pageId: page.id, contentSha256: actualHash, approvedBy: page.approval.approvedBy, approvedOn: page.approval.approvedOn };
  if (!evidence || Array.isArray(evidence) || Object.keys(evidence).some((key) => !Object.hasOwn(expected, key) && key !== 'verificationOnly')
    || !Object.entries(expected).every(([key, value]) => evidence[key] === value)
    || (!verificationOnly && (evidence.verificationOnly || /VERIFICATION ONLY|\*\*Verification only\*\*: true/i.test(contents)))) {
    throw Error(`Page ${page.id} approval is synthetic, stale, or inconsistent`);
  }
}

export async function readPageContent(root, { mode = 'review' } = {}) {
  if (!['review', 'production'].includes(mode)) throw Error('Unknown page content mode');
  const base = resolve(root, 'apps/web/src/content/pages');
  const names = readdirSync(base).filter((name) => name.endsWith('.json')).sort();
  const requiredIds = new Set(Object.keys(requiredPages));
  const recordIds = names.map((name) => name.slice(0, -5));
  if (recordIds.length !== requiredIds.size || new Set(recordIds).size !== recordIds.length || recordIds.some((id) => !requiredIds.has(id))) throw Error('Expected exactly one canonical JSON record for every MR-06 page');
  const pages = names.map((name) => {
    let page;
    try { page = pageSchema.parse(JSON.parse(readFileSync(resolve(base, name), 'utf8'))); }
    catch (error) { throw Error(`Invalid page record ${name}: ${error.message}`, { cause: error }); }
    const expected = requiredPages[page.id];
    if (!expected || expected.path !== page.path || expected.kind !== page.kind || name !== `${page.id}.json`) throw Error(`Page route identity mismatch for ${name}`);
    return page;
  });
  const paths = new Set(pages.map((page) => page.path));
  if (paths.size !== pages.length) throw Error('Page routes must be unique');
  for (const page of pages) {
    for (const action of [page.primaryAction, page.secondaryAction].filter(Boolean)) {
      if (action.href.startsWith('/') && !paths.has(action.href)) throw Error(`Page ${page.id} links to unknown route ${action.href}`);
    }
    if (page.status === 'approved') verifyPageApproval(root, page);
    if (mode === 'production' && page.status !== 'approved') throw Error(`Draft page content ${page.id} blocks production`);
  }
  return pages.sort((a, b) => a.path.localeCompare(b.path));
}
