import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { resolveBuild } from './brand-build.mjs';
import { readProjectContent } from './project-content.mjs';

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with status ${result.status}`);
}

export async function buildWeb(mode) {
  const root = resolve(import.meta.dirname, '..');
  const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', SITE_BUILD: mode };
  try {
    resolveBuild(root, env);
    await readProjectContent(root, env);
    run(process.execPath, [resolve(import.meta.dirname, '../node_modules/astro/bin/astro.mjs'), 'build'], {
      cwd: resolve(root, 'apps/web'), env,
    });
  } catch (error) {
    rmSync(resolve(root, 'apps/web/dist'), { recursive: true, force: true });
    throw error;
  }
}

if (process.argv[1]?.endsWith('build.mjs')) {
  const mode = process.argv[2] ?? 'review';
  if (!['review', 'production'].includes(mode)) throw new Error(`Unknown build mode: ${mode}`);
  await buildWeb(mode);
  run(process.execPath, ['../../node_modules/wrangler/bin/wrangler.js', 'deploy', '--dry-run', '--outdir', 'dist'], { cwd: 'apps/worker', env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: resolve('.wrangler/logs') } });
}
