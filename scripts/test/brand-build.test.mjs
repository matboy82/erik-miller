import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { resolveBuild } from '../brand-build.mjs';

function fixture() {
  const root = mkdtempSync(resolve('.tmp/brand-lock-test-'));
  mkdirSync(join(root, 'docs/brand'), { recursive: true });
  mkdirSync(join(root, 'docs/architecture/decisions'), { recursive: true });
  const lock = { version: 1, direction: 'B', copyDirection: 'C', taglineId: 'paper-first', approvedBy: 'Erik Miller', approvedOn: '2026-10-01', adr: 'docs/architecture/decisions/choice.md' };
  const record = { version: 1, direction: 'B', copyDirection: 'C', taglineId: 'paper-first', approvedBy: 'Erik Miller', approvedOn: '2026-10-01', approvalEvidence: 'docs/brand/sign-off.md' };
  writeFileSync(join(root, 'docs/brand/sign-off.md'), 'Test-only recorded approval example; not a real Erik choice.');
  const save = (value = lock, metadata = record, status = 'Accepted', extra = '') => {
    writeFileSync(join(root, 'docs/brand/brand-lock.json'), JSON.stringify(value));
    writeFileSync(join(root, lock.adr), `# Choice\n**Status**: ${status}\n${extra}\n**Approval recorded**: Erik Miller, 2026-10-01 [sign-off](../../brand/sign-off.md)\n\n\`\`\`brand-choice\n${JSON.stringify(metadata)}\n\`\`\`\n`);
  };
  save();
  return { root, lock, record, save, close() { rmSync(root, { recursive: true, force: true }); } };
}

test('B3 production selects the recorded visual/copy/tagline choice', () => {
  const f = fixture();
  try {
    const build = resolveBuild(f.root, { SITE_BUILD: 'production' });
    assert.equal(build.direction, 'B');
    assert.equal(build.content.headline, 'Remodeling, handled.');
    assert.equal(build.content.tagline, 'The remodel starts on paper — not in your kitchen.');
    assert.equal(build.review, false);
  } finally { f.close(); }
});

test('B3 invalid schema, date, approver, selections and ADR fail closed', () => {
  const f = fixture();
  try {
    for (const change of [
      { version: 2 }, { version: '1' }, { extra: true }, { direction: 'X' }, { copyDirection: 'X' }, { taglineId: 'unknown' },
      { approvedBy: 'Matt' }, { approvedOn: '2026-02-30' }, { approvedOn: 'yesterday' }, { taglineId: ['calmer'] },
      { adr: '../../escape.md' }, { adr: resolve('README.md') }, { adr: 'docs/architecture/decisions/missing.md' },
    ]) { f.save({ ...f.lock, ...change }); assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' })); }
    for (const field of Object.keys(f.lock)) {
      const value = { ...f.lock }; delete value[field]; f.save(value);
      assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }));
    }
    f.save(f.lock, { ...f.record, direction: 'A' });
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }), /match/);
    f.save({ ...f.lock, approvedBy: 'Matt' }, { ...f.record, approvedBy: 'Matt' });
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }), /schema/);
    f.save(f.lock, f.record, 'Proposed');
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }), /Accepted/);
    f.save(f.lock, f.record, 'Proposed', '**Status**: Accepted\nHistorical status only.');
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }), /Accepted/);
    f.save();
    writeFileSync(join(f.root, f.lock.adr), '# Policy ADR\n**Status**: Accepted\n');
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }), /brand-choice/);
    f.save(f.lock, f.record, 'Accepted', '**Verification only**: true');
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }), /fixture/);
    f.save(); rmSync(join(f.root, 'docs/brand/sign-off.md'));
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }), /evidence/);
    writeFileSync(join(f.root, 'docs/brand/brand-lock.json'), '{invalid');
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }));
    rmSync(join(f.root, 'docs/brand/brand-lock.json'));
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }));
  } finally { f.close(); }
});

test('B3 a decision path cannot escape through a directory junction', () => {
  const f = fixture();
  const link = join(f.root, 'docs/architecture/decisions/escape');
  try {
    writeFileSync(join(f.root, 'choice.md'), readFileSync(join(f.root, f.lock.adr)));
    symlinkSync(f.root, link, 'junction');
    f.save({ ...f.lock, adr: 'docs/architecture/decisions/escape/choice.md' });
    assert.throws(() => resolveBuild(f.root, { SITE_BUILD: 'production' }), /escapes/);
  } finally {
    // Remove only the junction itself before recursive fixture cleanup.
    try { unlinkSync(link); } catch { /* The junction may not have been created. */ }
    f.close();
  }
});

test('B3 mode and environment overrides cannot bypass the canonical lock', () => {
  const f = fixture();
  try {
    for (const env of [{ SITE_BUILD: 'production-check' }, { SITE_BUILD: 'unknown' },
      { SITE_BUILD: 'production', BRAND_DIRECTION: 'A' }, { SITE_BUILD: 'production', BRAND_LOCK_PATH: 'fixture.json' }]) {
      assert.throws(() => resolveBuild(f.root, env));
    }
    assert.equal(resolveBuild(f.root, {}).direction, 'A');
    assert.equal(readFileSync(join(f.root, 'docs/brand/brand-lock.json'), 'utf8'), JSON.stringify(f.lock));
  } finally { f.close(); }
});
