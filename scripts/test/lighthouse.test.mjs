import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const command = resolve('scripts/check-lighthouse.mjs');
function run(values, change = () => {}) {
  const directory = mkdtempSync(join(tmpdir(), 'miller-lighthouse-'));
  try {
    values.forEach((value, index) => {
      const report = {
        requestedUrl: 'http://localhost:4321/', finalDisplayedUrl: 'http://localhost:4321/',
        configSettings: { formFactor: 'mobile' },
        categories: Object.fromEntries(['performance', 'accessibility', 'best-practices'].map((name) => [name, { score: 0.95 }])),
        audits: { 'largest-contentful-paint': { numericValue: value } },
      };
      change(report, index);
      writeFileSync(join(directory, `lhr-${index}.json`), JSON.stringify(report));
    });
    return spawnSync(process.execPath, [command, directory], { encoding: 'utf8' });
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('F1 strict mobile command preserves optimistic three-run aggregation', () => {
  const result = run([2499.99, 2800, 3000]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /2499.99/);
});
test('F1 LCP equality and above threshold fail', () => {
  for (const values of [[2500, 2600, 2700], [2501, 2600, 2700]]) {
    const result = run(values);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /strictly below 2500/);
  }
});
test('F1 incomplete, malformed, wrong-page, nonmobile and invalid reports fail closed', () => {
  assert.equal(run([1000, 1000]).status, 1);
  for (const change of [
    (r) => { r.requestedUrl = 'https://example.com/'; },
    (r) => { r.finalDisplayedUrl = 'http://localhost:4321/other'; },
    (r) => { r.configSettings.formFactor = 'desktop'; },
    (r) => { r.audits['largest-contentful-paint'].numericValue = null; },
    (r) => { delete r.categories.accessibility; },
    (r) => { r.runtimeError = { code: 'PAGE_HUNG' }; },
  ]) assert.equal(run([1000, 1000, 1000], change).status, 1);
  const directory = mkdtempSync(join(tmpdir(), 'miller-lighthouse-'));
  try {
    for (let i = 0; i < 3; i++) writeFileSync(join(directory, `lhr-${i}.json`), '{bad json');
    assert.equal(spawnSync(process.execPath, [command, directory]).status, 1);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
