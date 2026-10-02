import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { arch, platform, release } from 'node:os';
import { resolve, relative } from 'node:path';
import { run, buildWeb } from './build.mjs';
import { stageBrandFixture, buildBrandFixture, removeBrandFixture } from './brand-fixture.mjs';

const repository = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const original = require('../lighthouserc.cjs');
const projectContent = process.argv.includes('--project-content');
if (process.argv.slice(2).some((argument) => argument !== '--project-content')) throw Error('Unknown measurement option');
const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const runDirectory = resolve(repository, projectContent ? '.lighthouseci/project' : '.lighthouseci/brand', String(Date.now()));
console.log(`Variant evidence directory: ${runDirectory}`);
function sourceSnapshot(root) {
  const snapshot = {};
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = resolve(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else snapshot[relative(root, file)] = hash(file);
    }
  }
  walk(resolve(root, 'apps/web/src'));
  for (const name of ['apps/web/astro.config.mjs', 'scripts/brand-build.mjs', 'scripts/production-artifact.mjs', 'scripts/project-content.mjs', 'scripts/project-artifact.mjs']) snapshot[name] = hash(resolve(root, name));
  return snapshot;
}
let failed = false;
const variants = (projectContent ? ['normal', 'replacement'] : ['normal']).flatMap((state) => ['A', 'B', 'C'].map((direction) => ({ state, direction })));
try {
  for (const { state, direction } of variants) {
    const fixture = stageBrandFixture(direction, { production: false });
    const evidence = projectContent ? resolve(runDirectory, state, direction) : resolve(runDirectory, direction);
    try {
      if (state === 'replacement') {
        // Only the project record changes. Both licensed assets already exist in the fixture.
        cpSync(resolve(fixture.root, 'docs/content/rehearsal.json'), resolve(fixture.root, 'apps/web/src/content/projects/representative.json'));
      }
      const dist = buildBrandFixture(fixture);
      const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
      if (!html.includes(`data-theme="${direction}"`) || !html.includes('data-design-review') || !html.includes(`value="${direction}" selected`)) throw Error('Variant fixture does not visibly select its direction.');
      const record = JSON.parse(readFileSync(resolve(fixture.root, 'apps/web/src/content/projects/representative.json'), 'utf8'));
      if (!html.includes('data-project="representative"') || !html.includes('Development stock photo') || !html.includes(record.title)) throw Error('Content state is not visibly represented');
      const config = JSON.parse(JSON.stringify(original));
      config.ci.collect.staticDistDir = dist;
      const configPath = resolve(fixture.root, 'lighthouserc.cjs');
      writeFileSync(configPath, `module.exports = ${JSON.stringify(config)};`);
      mkdirSync(evidence, { recursive: true });
      writeFileSync(resolve(evidence, 'fixture.json'), JSON.stringify({
        direction, state, production: false, fixtureChange: `reviewInitialDirection = '${direction}'${state === 'replacement' ? '; representative.json replaced with docs/content/rehearsal.json' : ''}`,
        recordSha256: hash(resolve(fixture.root, 'apps/web/src/content/projects/representative.json')),
        imageSha256: hash(resolve(fixture.root, record.image.path)), image: record.image,
        sourceSha256: hash(resolve(fixture.root, 'apps/web/src/content/brand.ts')),
        sourceFiles: sourceSnapshot(fixture.root),
        revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(),
        trackedDiffSha256: createHash('sha256').update(execFileSync('git', ['diff', '--binary', 'HEAD'], { cwd: repository })).digest('hex'),
        htmlSha256: hash(resolve(dist, 'index.html')), lockfileSha256: hash(resolve(repository, 'package-lock.json')),
        configSha256: hash(resolve(repository, 'lighthouserc.cjs')), settings: config.ci,
        node: process.version, os: { platform: platform(), release: release(), arch: arch() },
      }, null, 2));
      run(process.execPath, [resolve(repository, 'node_modules/@lhci/cli/src/cli.js'), 'autorun', `--config=${configPath}`], { cwd: fixture.root });
      run(process.execPath, [resolve(repository, 'scripts/check-lighthouse.mjs'), resolve(fixture.root, '.lighthouseci')], { cwd: repository });
      const reports = readdirSync(resolve(fixture.root, '.lighthouseci')).filter((name) => /^lhr-\d+\.json$/.test(name));
      if (reports.some((name) => JSON.parse(readFileSync(resolve(fixture.root, '.lighthouseci', name), 'utf8')).audits['errors-in-console']?.score !== 1)) throw Error('Review page has console errors; working comparison is unverified.');
      console.log(`Required mobile bar met for review direction ${direction}, content ${state}.`);
    } catch (error) {
      failed = true;
      console.error(`Review direction ${direction}, content ${state} did not complete its quality gate: ${error.message}`);
    } finally {
      const reports = resolve(fixture.root, '.lighthouseci');
      if (existsSync(reports)) cpSync(reports, resolve(evidence, 'reports'), { recursive: true });
      removeBrandFixture(fixture.root);
    }
  }
} finally {
  await buildWeb('review');
}
if (failed) process.exitCode = 1;
