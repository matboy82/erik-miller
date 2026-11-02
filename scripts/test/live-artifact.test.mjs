import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { verifyLive } from '../live-artifact.mjs';

test('live gate checks the actual active paths, not just the number of pages', () => {
  const root = mkdtempSync(join(tmpdir(), 'miller-routes-'));
  const html = '<meta name="robots" content="noindex, nofollow">';
  try {
    writeFileSync(join(root, 'index.html'), html);
    mkdirSync(join(root, 'privacy'));
    writeFileSync(join(root, 'privacy', 'index.html'), html);
    writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nDisallow: /');
    writeFileSync(join(root, '_headers'), 'X-Robots-Tag: noindex, nofollow');
    assert.doesNotThrow(() => verifyLive(root, { indexed: false, paths: ['/', '/privacy/'] }));
    assert.throws(() => verifyLive(root, { indexed: false, paths: ['/', '/terms/'] }), /routes do not match/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
