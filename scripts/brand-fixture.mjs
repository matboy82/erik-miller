import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { run } from './build.mjs';
import { sha256, contentCopyHash } from './project-content.mjs';

const repository = resolve(import.meta.dirname, '..');

export function stageBrandFixture(direction, { production = true, copyDirection = direction, taglineId = 'default' } = {}) {
  if (!['A', 'B', 'C'].includes(direction)) throw Error('Invalid fixture direction.');
  const parent = resolve(repository, '.tmp');
  mkdirSync(parent, { recursive: true });
  const root = mkdtempSync(resolve(parent, 'brand-fixture-'));
  try {
    for (const name of ['apps/web/src', 'apps/web/public', 'apps/web/astro.config.mjs', 'apps/web/tsconfig.json', 'apps/web/package.json', 'apps/web/node_modules/cookie', 'scripts/brand-build.mjs', 'scripts/production-artifact.mjs', 'scripts/live-artifact.mjs', 'scripts/site-seo.mjs', 'scripts/project-content.mjs', 'scripts/project-artifact.mjs', 'scripts/page-content.mjs', 'docs/content', 'PLACEHOLDERS.md']) {
      const target = resolve(root, name);
      mkdirSync(resolve(target, '..'), { recursive: true });
      cpSync(resolve(repository, name), target, { recursive: true });
    }
    writeFileSync(resolve(root, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    if (production) {
      const helper = resolve(root, 'scripts/brand-build.mjs');
      writeFileSync(helper, readFileSync(helper, 'utf8').replace('const verificationOnly = false;', 'const verificationOnly = true;'));
      const pageHelper = resolve(root, 'scripts/page-content.mjs');
      writeFileSync(pageHelper, readFileSync(pageHelper, 'utf8').replace('const verificationOnly = false;', 'const verificationOnly = true;'));
      mkdirSync(resolve(root, 'docs/brand'), { recursive: true });
      mkdirSync(resolve(root, 'docs/architecture/decisions'), { recursive: true });
      const lock = { version: 1, direction, copyDirection, taglineId, approvedBy: 'Erik Miller', approvedOn: '2026-10-01', adr: 'docs/architecture/decisions/fixture-choice.md' };
      writeFileSync(resolve(root, 'docs/brand/brand-lock.json'), JSON.stringify(lock));
      const { adr: ignored, ...choice } = lock;
      void ignored;
      writeFileSync(resolve(root, lock.adr), `# Synthetic verification choice\n**Status**: Accepted\n**Verification only**: true\n**Approval recorded**: Erik Miller, 2026-10-01 [synthetic evidence](../../brand/fixture-evidence.md)\n\n\`\`\`brand-choice\n${JSON.stringify({ ...choice, approvalEvidence: 'docs/brand/fixture-evidence.md' })}\n\`\`\`\n`);
      writeFileSync(resolve(root, 'docs/brand/fixture-evidence.md'), 'VERIFICATION ONLY. This synthetic example is not Erik approval and cannot authorize production.');
      stageProjectApprovalFixture(root);
      stageProductionRendererFixture(root);
    } else {
      const catalog = resolve(root, 'apps/web/src/content/brand.ts');
      writeFileSync(catalog, readFileSync(catalog, 'utf8').replace("export const reviewInitialDirection = 'A';", `export const reviewInitialDirection = '${direction}';`));
    }
    return { root, direction, copyDirection, taglineId, production };
  } catch (error) { removeBrandFixture(root); throw error; }
}

function stageProductionRendererFixture(root) {
  const config = resolve(root, 'apps/web/astro.config.mjs');
  writeFileSync(config, readFileSync(config, 'utf8').replace('integrations: [react(), {', 'integrations: [{'));
  // Guard fixtures have synthetic approvals and content, not a publishable website.
  // Keep their renderer independent of review-only stock stories and React previews.
  for (const [source, target] of [
    ['production-shell.astro', 'layouts/ProductionFixture.astro'],
    ['production-index.astro', 'pages/index.astro'],
    ['production-route.astro', 'pages/[...slug].astro'],
  ]) {
    cpSync(resolve(repository, 'scripts/test/fixtures', source), resolve(root, 'apps/web/src', target));
  }
  // The historical synthetic route inventory excludes the real site's error document.
  rmSync(resolve(root, 'apps/web/src/pages/404.astro'), { force: true });
  // The synthetic guard renderer does not use the site's branding assets.
  for (const asset of ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'favicon.ico', 'icon-192.png', 'icon-512.png', 'site.webmanifest']) {
    rmSync(resolve(root, 'apps/web/public', asset), { force: true });
  }
}

function stageProjectApprovalFixture(root) {
  const helper = resolve(root, 'scripts/project-content.mjs');
  writeFileSync(helper, readFileSync(helper, 'utf8').replace('const verificationOnly = false;', 'const verificationOnly = true;'));
  const image = 'apps/web/src/assets/projects/fixture-grid.png';
  cpSync(resolve(repository, 'scripts/test/fixtures/project-grid.png'), resolve(root, image));
  const record = {
    id: 'representative', title: 'Synthetic geometric content verification',
    paragraphs: ['A geometric test pattern exercises the content contract. This is synthetic verification evidence and makes no claim of completed Miller work.'],
    image: { path: image, alt: 'Synthetic geometric pattern for artifact verification.', width: 1280, height: 960, sha256: sha256(readFileSync(resolve(root, image))) },
    origin: 'miller', status: 'approved', source: 'https://example.invalid/synthetic-fixture', creator: 'Synthetic fixture', permission: 'Synthetic test permission',
    permissionEvidence: 'docs/content/fixture-permission.md', owner: 'Erik/Matt', substituteId: 'CONTENT-SUB-01', substituteEvidence: 'docs/content/substitutes/content-sub-01.md',
    approval: { approvedBy: 'Erik Miller', approvedOn: '2026-10-02', evidence: 'docs/content/approvals/fixture.md' },
  };
  mkdirSync(resolve(root, 'docs/content/approvals'), { recursive: true });
  writeFileSync(resolve(root, record.permissionEvidence), 'VERIFICATION ONLY. Synthetic test permission. Not permission to publish Miller work.');
  const approval = { recordId: record.id, imageSha256: record.image.sha256, copySha256: contentCopyHash(record), approvedBy: record.approval.approvedBy, approvedOn: record.approval.approvedOn, verificationOnly: true };
  writeFileSync(resolve(root, record.approval.evidence), `# VERIFICATION ONLY\n\n\`\`\`content-approval\n${JSON.stringify(approval)}\n\`\`\`\n`);
  const substitute = { id: record.substituteId, status: 'Closed', owner: record.owner, unblockCondition: 'Synthetic fixture verification only' };
  writeFileSync(resolve(root, record.substituteEvidence), `# VERIFICATION ONLY\n\n${record.approval.evidence}\n${record.image.sha256}\n${contentCopyHash(record)}\n\n\`\`\`content-substitute\n${JSON.stringify(substitute)}\n\`\`\`\n`);
  writeFileSync(resolve(root, 'apps/web/src/content/projects/representative.json'), JSON.stringify(record, null, 2));
  writeFileSync(resolve(root, 'PLACEHOLDERS.md'), readFileSync(resolve(root, 'PLACEHOLDERS.md'), 'utf8').replace(/\| Open \|/g, '| Closed |'));
  stagePageApprovalFixture(root);
}

function stagePageApprovalFixture(root) {
  const records = resolve(root, 'apps/web/src/content/pages');
  const evidenceDirectory = resolve(root, 'docs/content/approvals/pages');
  mkdirSync(evidenceDirectory, { recursive: true });
  for (const name of readdirSync(records).filter((entry) => entry.endsWith('.json'))) {
    const file = resolve(records, name);
    const page = JSON.parse(readFileSync(file, 'utf8'));
    page.title = `Synthetic ${page.id} verification`;
    page.description = 'Synthetic route metadata for isolated production guard verification.';
    page.heading = `Synthetic ${page.id} page`;
    page.intro = 'Synthetic verification content. This fixture is not customer copy.';
    page.sections = [{ heading: 'Fixture content', paragraphs: ['Synthetic production isolation verification only.'] }];
    if (page.processSteps) page.processSteps = ['Plan', 'Test', 'Build', 'Check', 'Finish'];
    page.status = 'approved';
    delete page.draftReason;
    const evidence = `docs/content/approvals/pages/${page.id}.md`;
    const approval = { approvedBy: 'Erik Miller', approvedOn: '2026-10-02', evidence, contentSha256: '' };
    const { status, draftReason, previousApproval, ...content } = page;
    void status; void draftReason; void previousApproval;
    approval.contentSha256 = createHash('sha256').update(JSON.stringify(content)).digest('hex');
    page.approval = approval;
    writeFileSync(file, JSON.stringify(page, null, 2));
    writeFileSync(resolve(root, evidence), `# VERIFICATION ONLY\n\n\`\`\`page-approval\n${JSON.stringify({ pageId: page.id, contentSha256: approval.contentSha256, approvedBy: approval.approvedBy, approvedOn: approval.approvedOn, verificationOnly: true })}\n\`\`\`\n`);
  }
}

export async function fixtureProjectArtifacts(fixture) {
  const { readProjectContent } = await import(pathToFileURL(resolve(fixture.root, 'scripts/project-content.mjs')).href);
  const { prepareProjectArtifacts } = await import(pathToFileURL(resolve(fixture.root, 'scripts/project-artifact.mjs')).href);
  return prepareProjectArtifacts(fixture.root, await readProjectContent(fixture.root, { SITE_BUILD: 'production' }));
}

export function buildBrandFixture(fixture) {
  run(process.execPath, [resolve(repository, 'node_modules/astro/bin/astro.mjs'), 'build'], {
    cwd: resolve(fixture.root, 'apps/web'),
    env: { ...process.env, PUBLIC_SITE_URL: 'https://miller-fixture.invalid', SITE_BUILD: fixture.production ? 'production' : 'review', ASTRO_TELEMETRY_DISABLED: '1' },
  });
  return resolve(fixture.root, 'apps/web/dist');
}

export function removeBrandFixture(root) {
  const parent = resolve(repository, '.tmp') + sep;
  const target = resolve(root);
  if (!target.startsWith(parent) || !target.slice(parent.length).startsWith('brand-fixture-') || target.slice(parent.length).includes(sep)) throw Error('Unsafe fixture cleanup path.');
  rmSync(target, { recursive: true, force: true });
}
