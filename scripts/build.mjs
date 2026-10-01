import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with status ${result.status}`);
}

export function buildWeb(mode, direction) {
  run(process.execPath, [resolve('node_modules/astro/bin/astro.mjs'), 'build'], {
    cwd: 'apps/web',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', SITE_BUILD: mode, BRAND_DIRECTION: direction ?? 'A' },
  });
}

if (process.argv[1]?.endsWith('build.mjs')) {
  const mode = process.argv[2] ?? 'review';
  if (!['review', 'production'].includes(mode)) throw new Error(`Unknown build mode: ${mode}`);
  let direction;
  if (mode === 'production') {
    const lock = JSON.parse(readFileSync('docs/brand/brand-lock.json', 'utf8'));
    if (!['A', 'B', 'C'].includes(lock.direction) || !lock.approvedBy || !lock.approvedOn || !lock.adr) {
      throw new Error('Production requires an approved direction, approver, date, and ADR in docs/brand/brand-lock.json.');
    }
    direction = lock.direction;
  }
  buildWeb(mode, direction);
  run(process.execPath, ['../../node_modules/wrangler/bin/wrangler.js', 'deploy', '--dry-run', '--outdir', 'dist'], { cwd: 'apps/worker', env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: resolve('.wrangler/logs') } });
}
