import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { run } from './build.mjs';

const repository = resolve(import.meta.dirname, '..');

export function stageBrandFixture(direction, { production = true, copyDirection = direction, taglineId = 'default' } = {}) {
  if (!['A', 'B', 'C'].includes(direction)) throw Error('Invalid fixture direction.');
  const parent = resolve(repository, '.tmp');
  mkdirSync(parent, { recursive: true });
  const root = mkdtempSync(resolve(parent, 'brand-fixture-'));
  try {
    for (const name of ['apps/web/src', 'apps/web/public', 'apps/web/astro.config.mjs', 'apps/web/tsconfig.json', 'apps/web/package.json', 'apps/web/node_modules/cookie', 'scripts/brand-build.mjs', 'scripts/production-artifact.mjs']) {
      const target = resolve(root, name);
      mkdirSync(resolve(target, '..'), { recursive: true });
      cpSync(resolve(repository, name), target, { recursive: true });
    }
    writeFileSync(resolve(root, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    if (production) {
      const helper = resolve(root, 'scripts/brand-build.mjs');
      writeFileSync(helper, readFileSync(helper, 'utf8').replace('const verificationOnly = false;', 'const verificationOnly = true;'));
      mkdirSync(resolve(root, 'docs/brand'), { recursive: true });
      mkdirSync(resolve(root, 'docs/architecture/decisions'), { recursive: true });
      const lock = { version: 1, direction, copyDirection, taglineId, approvedBy: 'Erik Miller', approvedOn: '2026-10-01', adr: 'docs/architecture/decisions/fixture-choice.md' };
      writeFileSync(resolve(root, 'docs/brand/brand-lock.json'), JSON.stringify(lock));
      const { adr: ignored, ...choice } = lock;
      void ignored;
      writeFileSync(resolve(root, lock.adr), `# Synthetic verification choice\n**Status**: Accepted\n**Verification only**: true\n**Approval recorded**: Erik Miller, 2026-10-01 [synthetic evidence](../../brand/fixture-evidence.md)\n\n\`\`\`brand-choice\n${JSON.stringify({ ...choice, approvalEvidence: 'docs/brand/fixture-evidence.md' })}\n\`\`\`\n`);
      writeFileSync(resolve(root, 'docs/brand/fixture-evidence.md'), 'VERIFICATION ONLY. This synthetic example is not Erik approval and cannot authorize production.');
    } else {
      const catalog = resolve(root, 'apps/web/src/content/brand.ts');
      writeFileSync(catalog, readFileSync(catalog, 'utf8').replace("export const reviewInitialDirection = 'A';", `export const reviewInitialDirection = '${direction}';`));
    }
    return { root, direction, copyDirection, taglineId, production };
  } catch (error) { removeBrandFixture(root); throw error; }
}

export function buildBrandFixture(fixture) {
  run(process.execPath, [resolve(repository, 'node_modules/astro/bin/astro.mjs'), 'build'], {
    cwd: resolve(fixture.root, 'apps/web'),
    env: { ...process.env, SITE_BUILD: fixture.production ? 'production' : 'review', ASTRO_TELEMETRY_DISABLED: '1' },
  });
  return resolve(fixture.root, 'apps/web/dist');
}

export function removeBrandFixture(root) {
  const parent = resolve(repository, '.tmp') + sep;
  const target = resolve(root);
  if (!target.startsWith(parent) || !target.slice(parent.length).startsWith('brand-fixture-') || target.slice(parent.length).includes(sep)) throw Error('Unsafe fixture cleanup path.');
  rmSync(target, { recursive: true, force: true });
}
