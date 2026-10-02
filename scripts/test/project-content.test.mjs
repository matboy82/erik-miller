import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync, writeFileSync, rmSync, cpSync, existsSync, symlinkSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { readProjectContent, contentCopyHash } from '../project-content.mjs';
import { stageBrandFixture, buildBrandFixture, removeBrandFixture, fixtureProjectArtifacts } from '../brand-fixture.mjs';
import { verifyProduction } from '../production-artifact.mjs';

test('C1 review content has validated provenance and visible label state', async () => {
  const project = await readProjectContent(resolve('.'), { SITE_BUILD: 'review' });
  assert.equal(project.id, 'representative');
  assert.equal(project.origin, 'stock');
  assert.equal(project.status, 'draft');
  assert.equal(project.stockLabel, 'Development stock photo — not Miller Remodeling work');
  assert.equal(project.draftLabel, 'Draft example writeup');
  assert.ok(project.paragraphs[0].includes('illustrative'));
  assert.ok(project.image.width > project.image.height);
});

test('C3 content eligibility rejects Open roots, missing/stale evidence and fixture bypasses', async () => {
  const fixture = stageBrandFixture('A');
  const file = resolve(fixture.root, 'apps/web/src/content/projects/representative.json');
  const register = resolve(fixture.root, 'PLACEHOLDERS.md');
  const { readProjectContent: fixtureRead } = await import(pathToFileURL(resolve(fixture.root, 'scripts/project-content.mjs')).href);
  try {
    const original = readFileSync(file, 'utf8');
    const rootOriginal = readFileSync(register, 'utf8');
    assert.equal((await fixtureRead(fixture.root, { SITE_BUILD: 'production' })).status, 'approved');
    await assert.rejects(readProjectContent(fixture.root, { SITE_BUILD: 'production' }), /Synthetic/);
    for (const status of ['Open', 'Unknown', '']) {
      writeFileSync(register, rootOriginal.replace(/\| Closed \|/, `| ${status} |`));
      await assert.rejects(fixtureRead(fixture.root, { SITE_BUILD: 'production' }), /placeholder/);
    }
    writeFileSync(register, rootOriginal);
    writeFileSync(register, rootOriginal + '\n  | EXTRA-01 | Additional unresolved material | Matt | Verify it | Open |\n');
    await assert.rejects(fixtureRead(fixture.root, { SITE_BUILD: 'production' }), /Open root placeholder EXTRA-01/);
    writeFileSync(register, rootOriginal);
    for (const change of [{ title: 'Edited title' }, { paragraphs: ['Edited approved prose'] }, { image: { ...JSON.parse(original).image, alt: 'Edited approved alternative text' } }, { status: 'draft', approval: undefined }]) {
      writeFileSync(file, JSON.stringify({ ...JSON.parse(original), ...change }));
      await assert.rejects(fixtureRead(fixture.root, { SITE_BUILD: 'production' }));
    }
    writeFileSync(file, original);
    for (const env of [{ SITE_BUILD: 'production-check' }, { SITE_BUILD: 'production', PLACEHOLDER_PATH: 'other.md' }, { SITE_BUILD: 'production', CONTENT_FIXTURE: 'true' }]) {
      await assert.rejects(fixtureRead(fixture.root, env), /forbidden/);
    }
    rmSync(resolve(fixture.root, 'docs/content/approvals/fixture.md'));
    await assert.rejects(fixtureRead(fixture.root, { SITE_BUILD: 'production' }));
    rmSync(file);
    await assert.rejects(fixtureRead(fixture.root, { SITE_BUILD: 'production' }), /representative/);
  } finally { removeBrandFixture(fixture.root); }
});

test('C3 complete built artifacts reject unused stock, altered media, hidden copy and embedded bytes', async () => {
  const fixture = stageBrandFixture('A');
  try {
    // Ordinary punctuation must survive Astro's HTML escaping in eligible content.
    const recordFile = resolve(fixture.root, 'apps/web/src/content/projects/representative.json');
    const record = JSON.parse(readFileSync(recordFile, 'utf8'));
    const previousCopyHash = contentCopyHash(record);
    record.title = 'Synthetic "kitchen" & design';
    record.image.alt = 'Synthetic "pattern" & dimensions.';
    record.paragraphs = ['A synthetic pattern tests the homeowner\'s "design" & approval boundary.'];
    const nextCopyHash = contentCopyHash(record);
    writeFileSync(recordFile, JSON.stringify(record));
    for (const evidence of [record.approval.evidence, record.substituteEvidence]) {
      const path = resolve(fixture.root, evidence);
      writeFileSync(path, readFileSync(path, 'utf8').replaceAll(previousCopyHash, nextCopyHash));
    }
    const output = buildBrandFixture(fixture);
    const selection = { projectArtifacts: await fixtureProjectArtifacts(fixture) };
    const inventory = verifyProduction(output, 'A', selection);
    assert.equal(inventory.filter((entry) => entry.path.endsWith('.webp')).length, 4);
    const htmlFile = resolve(output, 'index.html');
    const html = readFileSync(htmlFile, 'utf8');
    const draftParagraph = JSON.parse(readFileSync('docs/content/rehearsal.json', 'utf8')).paragraphs[1];
    for (const leak of [
      `<div hidden>${draftParagraph}</div>`,
      '<img hidden src="data:image/jpeg;base64,AAABBB" />',
      '<div hidden>Development stock photo</div>',
    ]) {
      writeFileSync(htmlFile, html.replace('</main>', leak + '</main>'));
      assert.throws(() => verifyProduction(output, 'A', selection), /development|embedded/i);
    }
    writeFileSync(htmlFile, html);
    const leaked = resolve(output, 'unused-stock.jpg');
    writeFileSync(leaked, readFileSync('apps/web/src/assets/projects/stock-kitchen-7166644.jpg'));
    assert.throws(() => verifyProduction(output, 'A', selection), /Unexpected/);
    rmSync(leaked);
    const unexpected = resolve(output, 'unused.json');
    writeFileSync(unexpected, '{"unrelated":"payload"}');
    assert.throws(() => verifyProduction(output, 'A', selection), /Unexpected/);
    rmSync(unexpected);
    const media = resolve(output, inventory.find((entry) => entry.path.endsWith('.webp')).path);
    const original = readFileSync(media);
    writeFileSync(media, Buffer.concat([original, Buffer.from('unauthorized')]));
    assert.throws(() => verifyProduction(output, 'A', selection), /Unexpected/);
    writeFileSync(media, original);
    assert.doesNotThrow(() => verifyProduction(output, 'A', selection));
  } finally { removeBrandFixture(fixture.root); }
});

test('C1 content authoring rejects invalid image, prose, and stock approval', async () => {
  const fixture = stageBrandFixture('A', { production: false });
  const file = resolve(fixture.root, 'apps/web/src/content/projects/representative.json');
  try {
    const original = JSON.parse(readFileSync(file, 'utf8'));
    for (const change of [
      { title: '' }, { paragraphs: [] }, { paragraphs: ['<script>alert(1)</script>'] },
      { image: { ...original.image, alt: '' } }, { image: { ...original.image, width: 1 } },
      { image: { ...original.image, path: '../../outside.jpg' } },
      { image: { ...original.image, path: 'https://example.com/photo.jpg' } },
      { image: { ...original.image, sha256: '0'.repeat(64) } }, { status: 'approved' }, { origin: 'miller' }, { permissionEvidence: 'docs/content/missing.md' },
    ]) {
      writeFileSync(file, JSON.stringify({ ...original, ...change }));
      await assert.rejects(readProjectContent(fixture.root, { SITE_BUILD: 'review' }));
    }
  } finally { removeBrandFixture(fixture.root); }
});

test('C3 production command failures clear stale output for stock and Open root placeholders', () => {
  const fixture = stageBrandFixture('A');
  const record = resolve(fixture.root, 'apps/web/src/content/projects/representative.json');
  const original = readFileSync(record);
  const register = resolve(fixture.root, 'PLACEHOLDERS.md');
  const originalRegister = readFileSync(register, 'utf8');
  const evidence = resolve(fixture.root, 'docs/content/substitutes/content-sub-01.md');
  const originalEvidence = readFileSync(evidence);
  try {
    const output = buildBrandFixture(fixture);
    writeFileSync(register, originalRegister.replace(/\| Closed \|/, '| Open |'));
    assert.throws(() => buildBrandFixture(fixture), /failed with status/);
    assert.equal(existsSync(output), false);
    cpSync('apps/web/src/content/projects/representative.json', record);
    cpSync('docs/content/substitutes/content-sub-01.md', evidence);
    cpSync('PLACEHOLDERS.md', register);
    assert.throws(() => buildBrandFixture(fixture), /failed with status/);
    assert.equal(existsSync(output), false);
    writeFileSync(record, original);
    writeFileSync(evidence, originalEvidence);
    writeFileSync(register, originalRegister);
    assert.ok(existsSync(buildBrandFixture(fixture)));
  } finally { removeBrandFixture(fixture.root); }
});

test('C1 image path cannot escape through a junction', async () => {
  const fixture = stageBrandFixture('A', { production: false });
  const record = resolve(fixture.root, 'apps/web/src/content/projects/representative.json');
  const link = resolve(fixture.root, 'apps/web/src/assets/projects/escape');
  try {
    cpSync('apps/web/src/assets/projects/stock-kitchen-7166644.jpg', resolve(fixture.root, 'outside.jpg'));
    symlinkSync(fixture.root, link, 'junction');
    const value = JSON.parse(readFileSync(record, 'utf8'));
    value.image.path = 'apps/web/src/assets/projects/escape/outside.jpg';
    writeFileSync(record, JSON.stringify(value));
    await assert.rejects(readProjectContent(fixture.root, { SITE_BUILD: 'review' }), /escapes/);
  } finally {
    if (existsSync(link)) unlinkSync(link);
    removeBrandFixture(fixture.root);
  }
});
