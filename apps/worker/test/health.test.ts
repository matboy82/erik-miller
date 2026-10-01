import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/index.ts';

test('health endpoint identifies the scaffold and is never cached', async () => {
  const response = await worker.fetch(new Request('https://worker.test/health'));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), {
    status: 'ok', service: 'miller-remodeling-intake', stage: 'scaffold',
  });
});

test('HEAD succeeds without a response body', async () => {
  const response = await worker.fetch(new Request('https://worker.test/health', { method: 'HEAD' }));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('health rejects mutations and unimplemented intake is a 404', async () => {
  const response = await worker.fetch(new Request('https://worker.test/health', { method: 'POST' }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
  assert.equal((await worker.fetch(new Request('https://worker.test/intake/lead', { method: 'POST' }))).status, 404);
});
