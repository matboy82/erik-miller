import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { verifyProduction } from '../check-production.mjs';

test('production isolation detects leaked controls and alternate token sets', () => {
  const directory = mkdtempSync(join(tmpdir(), 'miller-production-'));
  try {
    const file = join(directory, 'index.html');
    writeFileSync(file, '<html><style>:root{--brand-ink:#1B2420}</style></html>');
    assert.doesNotThrow(() => verifyProduction(directory, 'A'));
    writeFileSync(file, '<html data-theme="A"><style>:root{--brand-ink:#1B2420}</style></html>');
    assert.throws(() => verifyProduction(directory, 'A'), /review controls/);
    writeFileSync(file, '<html><style>:root{--brand-ink:#1B2420;--brand-graphite:#23262B}</style></html>');
    assert.throws(() => verifyProduction(directory, 'A'), /Unexpected token set B/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
