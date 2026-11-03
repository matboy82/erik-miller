import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { indexedHeaders, verifyLive } from '../live-artifact.mjs';

test('indexed headers block search indexing on Pages hosts without blocking the business domain', () => {
  const result = indexedHeaders('/*\n  X-Robots-Tag: noindex, nofollow\n  X-Frame-Options: DENY\n');
  assert.match(result, /https:\/\/erik-miller-web\.pages\.dev\/\*\n\s+X-Robots-Tag: noindex, nofollow/);
  assert.match(result, /https:\/\/:version\.erik-miller-web\.pages\.dev\/\*\n\s+X-Robots-Tag: noindex, nofollow/);
  assert.doesNotMatch(result.match(/^\/\*\n((?:[ \t]+[^\n]*\n)*)/m)?.[1] ?? '', /X-Robots-Tag/i);
  assert.match(result, /\/qualify\/\n\s+X-Robots-Tag: noindex, nofollow/);
});

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

test('indexed artifacts allow stock imagery only with explicit approval and still reject placeholders', () => {
  const root = mkdtempSync(join(tmpdir(), 'miller-approved-images-'));
  try {
    writeFileSync(join(root, 'index.html'), '<img src="/_astro/stock-kitchen.webp" alt="">');
    writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nAllow: /');
    writeFileSync(join(root, '_headers'), '/*\n  X-Frame-Options: DENY\n\n/qualify/\n  X-Robots-Tag: noindex\n\n/qualify/*\n  X-Robots-Tag: noindex');
    assert.throws(() => verifyLive(root, { indexed: true, paths: ['/'] }), /Stock photography/);
    assert.doesNotThrow(() => verifyLive(root, { indexed: true, paths: ['/'], currentImageryApproved: true }));
    writeFileSync(join(root, '_headers'), '/*\n  X-Robots-Tag: noindex\n\n/qualify/\n  X-Robots-Tag: noindex');
    assert.throws(() => verifyLive(root, { indexed: true, paths: ['/'], currentImageryApproved: true }), /site-wide noindex/);
    writeFileSync(join(root, '_headers'), '/qualify/\n  X-Robots-Tag: noindex');
    writeFileSync(join(root, 'index.html'), '<p>[Unresolved fact]</p>');
    assert.throws(() => verifyLive(root, { indexed: true, paths: ['/'], currentImageryApproved: true }), /Unresolved business facts/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
