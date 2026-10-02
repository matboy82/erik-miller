import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { planDeployment, verifyReviewArtifact, verifyLiveSite, verifyLiveWorker, assertCurrentMain } from '../test-deployment.mjs';

const sha = 'a'.repeat(40);
const base = { VERIFY_RESULT: 'success', GITHUB_EVENT_NAME: 'push',
  GITHUB_REF: 'refs/heads/main', GITHUB_SHA: sha, GITHUB_REPOSITORY: 'bis/miller', PAGES_PROJECT: 'erik-miller' };
test('F2 main and same-repository PR have isolated deployment plans', () => {
  assert.deepEqual(planDeployment(base, {}), { branch: 'main', worker: true, project: 'erik-miller', sha });
  const pr = { number: 12, pull_request: { head: { repo: { full_name: 'bis/miller' } }, base: { repo: { full_name: 'bis/miller' } } } };
  assert.equal(planDeployment({ ...base, GITHUB_EVENT_NAME: 'pull_request', GITHUB_REF: 'refs/pull/12/merge' }, pr).branch, 'pr-12');
  assert.equal(planDeployment({ ...base, GITHUB_EVENT_NAME: 'pull_request', GITHUB_REF: 'refs/pull/12/merge' }, pr).worker, false);
  pr.pull_request.head.repo.full_name = 'fork/miller';
  assert.throws(() => planDeployment({ ...base, GITHUB_EVENT_NAME: 'pull_request', GITHUB_REF: 'refs/pull/12/merge' }, pr), /not authorized/);
});
test('F2 failed, skipped, cancelled, wrong event/ref and missing config reject', () => {
  for (const override of [
    ...['failure', 'cancelled', 'skipped', ''].map((VERIFY_RESULT) => ({ VERIFY_RESULT })),
    { GITHUB_EVENT_NAME: 'pull_request_target' }, { GITHUB_REF: 'refs/heads/other' },
    { PAGES_PROJECT: '' }, { PAGES_PROJECT: '$(unsafe)' }, { GITHUB_SHA: '' },
  ]) assert.throws(() => planDeployment({ ...base, ...override }, {}));
});
test('F2 stale main and API failure cannot publish', async () => {
  await assertCurrentMain(base, async () => Response.json({ object: { sha } }));
  await assert.rejects(assertCurrentMain(base, async () => Response.json({ object: { sha: 'b'.repeat(40) } })), /stale/);
  await assert.rejects(assertCurrentMain(base, async () => new Response('', { status: 403 })), /main revision/);
});

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
test('F2 workflow keeps secrets exclusively in guarded deployment step', () => {
  const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
  const [verify, deploy] = workflow.split('  test-deploy:');
  assert.ok(deploy);
  assert.doesNotMatch(verify, /secrets\./);
  assert.doesNotMatch(workflow, /pull_request_target/);
  assert.doesNotMatch(workflow, /ENABLE_TEST_DEPLOYS/);
  assert.match(deploy, /needs: verify/);
  assert.match(deploy, /needs\.verify\.result == 'success'/);
  assert.match(deploy, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
  assert.match(deploy, /cancel-in-progress: false/);
  const secretStep = deploy.indexOf('      - name: Deploy verified test resources');
  assert.ok(secretStep > 0);
  assert.doesNotMatch(deploy.slice(0, secretStep), /secrets\./);
  assert.match(deploy.slice(secretStep), /node scripts\/test-deployment.mjs/);
  assert.match(verify, /include-hidden-files: true/);
});

test('F2 deployment command rejects failed verification without retaining credentials', () => {
  const directory = mkdtempSync(join(tmpdir(), 'miller-deploy-command-'));
  try {
    const eventPath = join(directory, 'event.json');
    writeFileSync(eventPath, '{}');
    const result = spawnSync(process.execPath, ['scripts/test-deployment.mjs'], {
      encoding: 'utf8', env: { ...base, VERIFY_RESULT: 'failure', GITHUB_EVENT_PATH: eventPath,
        CLOUDFLARE_API_TOKEN: 'harmless-credential-sentinel' },
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stdout, /failed at preflight/);
    assert.doesNotMatch(result.stdout + result.stderr, /harmless-credential-sentinel/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
