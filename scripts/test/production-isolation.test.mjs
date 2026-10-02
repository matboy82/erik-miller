import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { verifyProduction } from '../check-production.mjs';
import { brandCss } from '../brand-build.mjs';
import { resolve } from 'node:path';

test('production isolation detects leaked controls and alternate token sets', () => {
  const directory = mkdtempSync(join(tmpdir(), 'miller-production-'));
  try {
    const file = join(directory, 'index.html');
    const valid = `<html><style>${brandCss(resolve('.'), { review: false, direction: 'A' })}</style>
      <p data-copy="tagline">Designed first. Built right.</p>
      <h1 data-copy="headline">Kitchens and baths, designed before they're built.</h1>
      <p data-copy="description">25 years of Treasure Valley remodels. You approve the floorplans, selections, and 3D walkthrough before demo day — then we build it on time and on budget.</p>
      <h2 data-copy="process">One process, from first sketch to final walkthrough.</h2></html>`;
    writeFileSync(file, valid);
    assert.doesNotThrow(() => verifyProduction(directory, 'A'));
    writeFileSync(file, valid.replace('<html>', '<html data-theme="A">'));
    assert.throws(() => verifyProduction(directory, 'A'), /review controls/);
    writeFileSync(file, valid.replace('</style>', ':root{--brand-graphite:#23262B}</style>'));
    assert.throws(() => verifyProduction(directory, 'A'), /Unexpected token set B/);
    writeFileSync(file, valid);
    const leaked = join(directory, 'unused.json');
    writeFileSync(leaked, JSON.stringify({ unused: 'Remodeling, handled.' }));
    assert.throws(() => verifyProduction(directory, 'A'), /alternative copy/);
    writeFileSync(leaked, '{"unused":"Remodeling, handled\\u002e"}');
    assert.throws(() => verifyProduction(directory, 'A'), /alternative copy/);
    rmSync(leaked);
    writeFileSync(join(directory, 'unused.woff2'), 'unselected-font');
    assert.throws(() => verifyProduction(directory, 'A'), /Unexpected shipped asset/);
    rmSync(join(directory, 'unused.woff2'));
    writeFileSync(file, valid.replace('Designed first. Built right.', 'Wrong tagline'));
    assert.throws(() => verifyProduction(directory, 'A'), /tagline/);
    writeFileSync(file, valid.replace(/data:font\/woff2;base64,[A-Za-z0-9+/=]+/, 'data:font/woff2;base64,AAAA'));
    assert.throws(() => verifyProduction(directory, 'A'), /font assets/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
