import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildWeb } from './build.mjs';

export function verifyProduction(directory, direction) {
  function texts(path) {
    return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
      const file = resolve(path, entry.name);
      if (entry.isDirectory()) return texts(file);
      return /\.(html|css|js)$/.test(file) ? [readFileSync(file, 'utf8')] : [];
    });
  }
  const output = texts(directory).join('\n');
  if (!output.includes('<html') || /data-design-review|review-toolbar|review-theme|review-copy|data-theme|miller-design-review|localStorage/.test(output)) {
    throw new Error('Production includes review controls, theme switching, or no rendered page.');
  }
  const keys = { A: '--brand-ink', B: '--brand-graphite', C: '--brand-espresso' };
  for (const [candidate, key] of Object.entries(keys)) {
    if (output.includes(key) !== (candidate === direction)) throw new Error(`Unexpected token set ${candidate} in production ${direction}.`);
  }
}

if (process.argv[1]?.endsWith('check-production.mjs')) {
  for (const direction of ['A', 'B', 'C']) {
    buildWeb('production-check', direction);
    verifyProduction('apps/web/dist-production-check', direction);
    console.log(`Production isolation passed for direction ${direction}.`);
  }
  console.log('These are disposable verification builds, not an approved brand lock or release.');
}
