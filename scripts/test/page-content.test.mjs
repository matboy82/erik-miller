import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { pageContentHash, readPageContent, staticPagePath } from '../page-content.mjs';

const requiredPaths = [
  '/', '/kitchen-remodeling/', '/bathroom-remodeling/', '/whole-home-remodeling/',
  '/additions/', '/adu-mother-in-law/', '/home-repair/', '/about-process/',
  '/portfolio/', '/contact/', '/service-areas/eagle/', '/service-areas/star/',
  '/service-areas/meridian/', '/service-areas/boise/', '/service-areas/middleton/',
  '/service-areas/kuna/',
];

test('MR-06 review content has one visibly Draft record for every required route', async () => {
  const pages = await readPageContent(resolve('.'), { mode: 'review' });
  assert.deepEqual(pages.map((page) => page.path).sort(), [...requiredPaths].sort());
  assert.ok(pages.every((page) => page.status === 'draft'));
  assert.ok(pages.every((page) => page.draftReason.includes('Erik')));
  assert.ok(pages.filter((page) => page.id !== 'contact').every((page) => page.primaryAction.href === '/contact/'));
  assert.equal(pages.find((page) => page.id === 'contact').primaryAction.href, 'tel:+12086084439');
  const generatedRoutes = pages.filter((page) => page.id !== 'home').map((page) => staticPagePath(page).params.slug);
  assert.deepEqual(generatedRoutes.map((slug) => `/${slug}/`).sort(), requiredPaths.filter((path) => path !== '/').sort());
  assert.ok(pages.every((page) => page.title.length > 10 && page.description.length > 20));
});

test('MR-06 production page content requires Erik approval and rejects test copy', async () => {
  await assert.rejects(readPageContent(resolve('.'), { mode: 'production' }), /Draft page content/);
});

test('MR-06 production approval matches exact content and rejects synthetic evidence', async () => {
  const fixture = mkdtempSync(join(tmpdir(), 'mr06-page-approval-'));
  try {
    cpSync('apps/web/src/content/pages', join(fixture, 'apps/web/src/content/pages'), { recursive: true });
    const approvalDir = join(fixture, 'docs/content/approvals/pages');
    mkdirSync(approvalDir, { recursive: true });
    for (const file of (await import('node:fs')).readdirSync(join(fixture, 'apps/web/src/content/pages'))) {
      const path = join(fixture, 'apps/web/src/content/pages', file);
      const page = JSON.parse(readFileSync(path, 'utf8'));
      page.status = 'approved';
      delete page.draftReason;
      page.approval = { approvedBy: 'Erik Miller', approvedOn: '2026-10-02', evidence: `docs/content/approvals/pages/${page.id}.md`, contentSha256: '' };
      page.approval.contentSha256 = pageContentHash(page);
      writeFileSync(path, JSON.stringify(page));
      writeFileSync(join(approvalDir, `${page.id}.md`), `\`\`\`page-approval\n${JSON.stringify({ pageId: page.id, contentSha256: page.approval.contentSha256, approvedBy: 'Erik Miller', approvedOn: '2026-10-02' })}\n\`\`\`\n`);
    }
    assert.equal((await readPageContent(fixture, { mode: 'production' })).length, requiredPaths.length);
    const target = join(fixture, 'apps/web/src/content/pages/kitchen.json');
    const changed = JSON.parse(readFileSync(target, 'utf8'));
    changed.heading += ' edited';
    writeFileSync(target, JSON.stringify(changed));
    await assert.rejects(readPageContent(fixture, { mode: 'production' }), /approval hash is stale/);
    changed.heading = changed.heading.replace(' edited', '');
    const validHash = changed.approval.contentSha256;
    changed.approval.contentSha256 = '0'.repeat(64);
    writeFileSync(target, JSON.stringify(changed));
    await assert.rejects(readPageContent(fixture, { mode: 'production' }), /approval hash is stale/);
    changed.approval.contentSha256 = validHash;
    writeFileSync(target, JSON.stringify(changed));
    const approvalPath = join(approvalDir, 'kitchen.md');
    const evidence = JSON.parse(readFileSync(approvalPath, 'utf8').match(/```page-approval\s*\n([\s\S]*?)\n```/)[1]);
    evidence.verificationOnly = true;
    writeFileSync(approvalPath, `\`\`\`page-approval\n${JSON.stringify(evidence)}\n\`\`\`\n`);
    await assert.rejects(readPageContent(fixture, { mode: 'production' }), /approval is synthetic, stale, or inconsistent/);
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});

