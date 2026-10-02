import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const result = spawnSync(process.execPath, [resolve(import.meta.dirname, '../node_modules/astro/bin/astro.mjs'), ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});
if ((result.error || result.status !== 0) && process.argv[2] === 'build' && process.env.SITE_BUILD === 'production') {
  rmSync(resolve(import.meta.dirname, '../apps/web/dist'), { recursive: true, force: true });
}
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
