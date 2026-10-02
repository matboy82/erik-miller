import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { verifyReviewArtifact, verifyLiveSite, verifyLiveWorker } from '../test-deployment.mjs';

function artifact(action) {
  const directory = mkdtempSync(join(tmpdir(), 'miller-review-'));
  try {
    writeFileSync(join(directory, 'index.html'), '<html><head><meta name="robots" content="noindex, nofollow"></head></html>');
    writeFileSync(join(directory, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');
    writeFileSync(join(directory, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    action(directory);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
test('F3/F4 complete artifact noindex and credential sentinel controls', () => {
  artifact((dir) => {
    verifyReviewArtifact(dir, ['harmless-credential-sentinel']);
    mkdirSync(join(dir, 'unused'));
    writeFileSync(join(dir, 'unused', 'photo.bin'), 'harmless-credential-sentinel');
    assert.throws(() => verifyReviewArtifact(dir, ['harmless-credential-sentinel']), /credential/);
  });
  for (const file of ['index.html', '_headers', 'robots.txt']) artifact((dir) => {
    writeFileSync(join(dir, file), 'indexable');
    assert.throws(() => verifyReviewArtifact(dir, []), /noindex/);
  });
});
const siteResponse = (url) => url.endsWith('/robots.txt')
  ? new Response('User-agent: *\nDisallow: /\n', { headers: { 'x-robots-tag': 'noindex, nofollow' } })
  : new Response('<html><meta name="robots" content="noindex, nofollow"></html>', { headers: { 'x-robots-tag': 'noindex, nofollow' } });
test('F3 live site requires HTTPS test hostname, successful page/robots and all noindex boundaries', async () => {
  await verifyLiveSite('https://abc.erik-miller.pages.dev', 'erik-miller', async (url) => siteResponse(url));
  for (const url of ['https://miller.example.com', 'http://erik-miller.pages.dev', 'https://other.pages.dev']) {
    await assert.rejects(verifyLiveSite(url, 'erik-miller', async () => siteResponse('page')));
  }
  for (const response of [
    new Response('unavailable', { status: 503 }),
    new Response('<meta name="robots" content="noindex">'),
    new Response('<html>indexable</html>', { headers: { 'x-robots-tag': 'noindex' } }),
  ]) await assert.rejects(verifyLiveSite('https://erik-miller.pages.dev', 'erik-miller', async () => response.clone()));
  await assert.rejects(verifyLiveSite('https://erik-miller.pages.dev', 'erik-miller', async (url) => url.endsWith('robots.txt') ? new Response('User-agent: *\nAllow: /') : siteResponse(url)));
});
test('F3 live health requires test Worker, scaffold payload, and no-store', async () => {
  const good = () => Response.json({ status: 'ok', service: 'miller-remodeling-intake', stage: 'scaffold' }, { headers: { 'cache-control': 'no-store' } });
  await verifyLiveWorker('https://erik-miller.bis.workers.dev', async () => good());
  await assert.rejects(verifyLiveWorker('https://production.bis.workers.dev', async () => good()));
  await assert.rejects(verifyLiveWorker('https://erik-miller.bis.workers.dev', async () => Response.json({ status: 'ok' })));
});
test('F2 GitHub workflow verifies without publishing or deployment credentials', () => {
  const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
  assert.doesNotMatch(workflow, /secrets\.|test-deploy:|test-deployment\.mjs|wrangler|ENABLE_TEST_DEPLOYS|CLOUDFLARE_|pull_request_target/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /npm run lighthouse/);
  assert.match(workflow, /include-hidden-files: true/);
});
