import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { runProbe } from '../jobtread-verification.mjs';

const image = readFileSync(new URL('./fixtures/jobtread-probe.png', import.meta.url));
const plan = () => ({
  version: 1, apiVersion: 'bfb7d450125394d0bcd0cecf9c65573b09a56451',
  approvedBy: 'Matt', approvedOn: '2026-10-02', organizationId: 'synthetic-org',
  boundary: 'isolated-synthetic', runMarker: 'MR04-unit',
  customFieldValues: { 'field-type': 'Kitchen' }, imageSha256: createHash('sha256').update(image).digest('hex'), imageBytes: image.length,
  transferOrigins: ['https://uploads.jobtread.test'], sideEffectsReviewed: true, permissionsReviewed: true,
  cleanup: 'delete-records', cleanupReviewed: true, orphanUploadRetentionApproved: true,
  maxAttempts: 1, requestBudget: 60, timeoutMs: 1000,
});

const credentialProvider = () => ({ apiUrl: 'https://api.jobtread.com/pave', key: 'credential-sentinel' });
const jobRecord = () => ({ id: 'job-1', name: 'MR04-unit', organization: { id: 'synthetic-org' },
  location: { id: 'location-1', account: { id: 'customer-1' } },
  customFieldValues: { nextPage: null, nodes: [{ id: 'value-1', value: 'Kitchen', customField: { id: 'field-type' } }] } });
const fileRecord = () => ({ id: 'file-1', name: 'MR04-unit-photo.png', organization: { id: 'synthetic-org' },
  job: { id: 'job-1' }, url: 'https://uploads.jobtread.test/photo?token=signed-url-sentinel' });

function steps() {
  return [
    { organization: { id: 'synthetic-org' }, version: 'bfb7d450125394d0bcd0cecf9c65573b09a56451' },
    { createAccount: { createdAccount: { id: 'customer-1', name: 'MR04-unit', organization: { id: 'synthetic-org' } } } },
    { createLocation: { createdLocation: { id: 'location-1', name: 'MR04-unit', account: { id: 'customer-1' } } } },
    { createJob: { createdJob: { id: 'job-1', name: 'MR04-unit', location: { id: 'location-1' }, organization: { id: 'synthetic-org' } } } },
    { job: jobRecord() },
    { createUploadRequest: { createdUploadRequest: { id: 'upload-1', url: 'https://uploads.jobtread.test/upload?token=signed-url-sentinel', method: 'PUT', headers: { 'Content-Type': 'image/png' } } } },
    new Response(null, { status: 200 }),
    { createFile: { createdFile: { id: 'file-1' } } },
    { file: fileRecord() },
    new Response(image),
  ];
}

function fakeTransport(replies) {
  const requests = [];
  const transport = async (url, options) => {
    requests.push({ url, options });
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal);
    const response = replies.shift();
    if (response instanceof Error) throw response;
    assert.notEqual(response, undefined, 'unexpected request');
    return response instanceof Response ? response : Response.json(response);
  };
  return { transport, requests };
}

async function intake(replies = steps(), extra = {}) {
  const fake = fakeTransport(replies);
  const saved = [];
  const result = await runProbe({ scenario: 'intake', live: true, plan: plan(), image,
      credentialProvider, saveInventory: value => saved.push(globalThis.structuredClone(value)), ...fake, ...extra });
  return { result, saved, requests: fake.requests };
}

test('default invocation validates offline without credentials or dispatch', async () => {
  let calls = 0;
  const result = await runProbe({ plan: plan(), transport: async () => { calls++; },
    credentialProvider: () => { throw new Error('must not read credentials'); } });
  assert.equal(result.stage, 'validated');
  assert.equal(result.evidenceKind, 'Unverified');
  assert.equal(result.checks.plan, true);
  assert.equal(calls, 0);
});

test('incomplete, unapproved or invalid boundaries refuse live dispatch', async () => {
  for (const change of [
    { approvedBy: '' }, { organizationId: '' }, { boundary: 'production' },
    { customFieldValues: {} }, { sideEffectsReviewed: false }, { permissionsReviewed: false }, { cleanupReviewed: false },
    { orphanUploadRetentionApproved: false }, { transferOrigins: ['http://localhost'] },
    { transferOrigins: ['https://127.0.0.1'] }, { transferOrigins: ['https://api.jobtread.com'] },
    { maxAttempts: 9 }, { requestBudget: 1000 }, { apiVersion: 'unknown' },
  ]) {
    let calls = 0;
    const result = await runProbe({ scenario: 'intake', live: true, plan: { ...plan(), ...change },
      image, saveInventory: () => {},
      transport: async () => { calls++; }, credentialProvider: () => ({ apiUrl: 'https://api.jobtread.com/pave', key: 'safe-sentinel' }) });
    assert.equal(calls, 0);
    assert.equal(result.errorCategory, 'invalid-plan');
  }
});

test('unknown scenarios cannot dispatch and cannot leak their input', async () => {
  const result = await runProbe({ scenario: 'https://private.test/?key=secret-sentinel', live: true, plan: plan() });
  assert.equal(result.errorCategory, 'invalid-scenario');
  assert.ok(!JSON.stringify(result).includes('secret-sentinel'));
});

test('J1 retrieves linked records, field values and original photo; transfers omit grant key', async () => {
  const { result, saved, requests } = await intake();
  assert.equal(result.status, 'Verified');
  assert.equal(result.evidenceKind, 'Simulation');
  assert.equal(result.checks.relationship, true);
  assert.equal(result.checks.customFields, true);
  assert.equal(result.checks.photoIdentity, true);
  assert.deepEqual(result.recordCounts, { customer: 1, location: 1, job: 1, upload: 1, file: 1 });
  assert.equal(saved.at(-1).records.length, 5);
  const body = JSON.parse(requests[3].options.body);
  assert.equal(body.query.createJob.$.locationId, 'location-1');
  assert.equal(body.query.$.notify, false);
  assert.ok(requests.filter(r => r.url.startsWith('https://uploads.')).every(r => !JSON.stringify(r.options).includes('credential-sentinel')));
  assert.ok(!JSON.stringify(result).includes('customer-1'));
  assert.ok(!JSON.stringify(result).includes('signed-url-sentinel'));
});

test('J1 mismatched organization is refused before writes', async () => {
  const { result, requests } = await intake([{ ...steps()[0], organization: { id: 'different-org' } }]);
  assert.equal(result.errorCategory, 'boundary-mismatch');
  assert.equal(requests.length, 1);
});

test('changed vendor schema stops before writes', async () => {
  const { result, requests } = await intake([{ ...steps()[0], version: 'new-version' }]);
  assert.equal(result.errorCategory, 'schema-version-mismatch');
  assert.equal(requests.length, 1);
});

test('J1 comparisons traverse all custom-field pages', async () => {
  const replies = steps();
  replies[4].job.customFieldValues = { nextPage: 'page-two', nodes: [] };
  replies.splice(5, 0, { job: jobRecord() });
  const { result, requests } = await intake(replies);
  assert.equal(result.checks.customFields, true);
  assert.equal(JSON.parse(requests[5].options.body).query.job.customFieldValues.$.page, 'page-two');
});

test('J2 duplicate scenario requires approval and reports distinct or reused customer IDs', async () => {
  const { result: refused, requests } = await intake([], { scenario: 'duplicate' });
  assert.equal(refused.errorCategory, 'repeat-not-approved');
  assert.equal(requests.length, 0);
  for (const reuse of [false, true]) {
    const first = steps();
    const second = steps().slice(1);
    if (!reuse) {
      const replaceIds = JSON.stringify(second.slice(0, 5)).replaceAll('customer-1', 'customer-2').replaceAll('location-1', 'location-2').replaceAll('job-1', 'job-2');
      const changed = JSON.parse(replaceIds);
      for (let i = 0; i < changed.length; i++) second[i] = changed[i];
      second[7].file.job.id = 'job-2';
    }
    const { result } = await intake([...first, ...second], { scenario: 'duplicate', plan: { ...plan(), maxAttempts: 2 } });
    assert.equal(result.status, 'Verified');
    assert.equal(result.duplicateOutcome, reuse ? 'reused-record' : 'distinct-records');
  }
});

test('J2 request budgets and inventory storage failures stop further dispatch', async () => {
  const { result, requests } = await intake(steps(), { plan: { ...plan(), requestBudget: 2 } });
  assert.equal(result.errorCategory, 'request-budget-exhausted');
  assert.equal(requests.length, 2);
  const failed = await intake(steps(), { saveInventory: () => { throw new Error('private-inventory-sentinel'); } });
  assert.equal(failed.result.errorCategory, 'inventory-storage-failed');
  assert.equal(failed.requests.length, 1);
  assert.ok(!JSON.stringify(failed.result).includes('private-inventory-sentinel'));
});

test('J2 existing and ambiguous inventories cannot replay intake or cleanup blindly', async () => {
  const { saved } = await intake();
  for (const extra of [
    { inventory: saved.at(-1) },
    { scenario: 'cleanup', inventory: { ...saved.at(-1), pendingWrite: { stage: 'upload', attempt: 1 } } },
    { inventory: { ...saved.at(-1), organizationId: 'other' } },
  ]) {
    const { result, requests } = await intake([], extra);
    assert.equal(result.status, 'Unverified');
    assert.equal(requests.length, 0);
  }
});

test('cleanup verifies run ownership and confirms each record absent, leaving uploads explicitly retained', async () => {
  const { saved } = await intake();
  const replies = [steps()[0], { file: fileRecord() }, { deleteFile: {} }, { file: null },
    { job: jobRecord() }, { deleteJob: {} }, { job: null },
    { location: { id: 'location-1', name: 'MR04-unit', account: { id: 'customer-1', organization: { id: 'synthetic-org' } } } },
    { deleteLocation: {} }, { location: null },
    { account: { id: 'customer-1', name: 'MR04-unit', organization: { id: 'synthetic-org' } } },
    { deleteAccount: {} }, { account: null }];
  const { result, saved: cleanupInventory } = await intake(replies, { scenario: 'cleanup', inventory: saved.at(-1) });
  assert.equal(result.checks.cleanup, true);
  assert.equal(result.cleanup, 'records-deleted-uploads-retained-approved');
  assert.equal(cleanupInventory.at(-1).records.filter(r => r.deleted).length, 4);
  assert.equal(cleanupInventory.at(-1).records.find(r => r.kind === 'upload').deleted, false);
});

test('cleanup refuses foreign ownership and a failed deletion confirmation', async () => {
  const { saved } = await intake();
  const foreign = fileRecord(); foreign.name = 'real-customer-photo.png';
  const refused = await intake([steps()[0], { file: foreign }], { scenario: 'cleanup', inventory: saved.at(-1) });
  assert.equal(refused.result.errorCategory, 'cleanup-ownership-mismatch');
  assert.equal(refused.requests.length, 2);
  const unconfirmed = await intake([steps()[0], { file: fileRecord() }, { deleteFile: {} }, { file: { id: 'file-1' } }],
    { scenario: 'cleanup', inventory: saved.at(-1) });
  assert.equal(unconfirmed.result.errorCategory, 'cleanup-not-confirmed');
  assert.equal(unconfirmed.result.cleanup, 'incomplete');
});

test('F4 raw payload extensions and vendor errors never appear in output', async () => {
  const replies = steps();
  replies[1].private = { apiKey: 'secret-response-sentinel', email: 'private-pii-sentinel' };
  const good = await intake(replies);
  assert.ok(!JSON.stringify(good.result).includes('sentinel'));
  const failed = await intake([steps()[0], Response.json({ error: { message: 'secret-response-sentinel', key: 'credential-sentinel' } })]);
  assert.equal(failed.result.errorCategory, 'api-error');
  assert.ok(!JSON.stringify(failed.result).includes('sentinel'));
});

test('J1 detects wrong links, field values and photo content', async () => {
  for (const branch of ['relationship', 'customFields', 'photoIdentity']) {
    const replies = steps();
    if (branch === 'relationship') replies[4].job.location.account.id = 'other-customer';
    if (branch === 'customFields') replies[4].job.customFieldValues.nodes[0].value = 'Bathroom';
    if (branch === 'photoIdentity') replies[9] = new Response('wrong-photo');
    const { result } = await intake(replies);
    assert.equal(result.status, 'Unverified');
    assert.equal(result.checks[branch], false);
    assert.equal(result.errorCategory, 'comparison-failed');
  }
});

test('J2 partial and transient writes stop without retries and retain returned IDs privately', async () => {
  for (const failureAt of [3, 5]) {
    const replies = steps().slice(0, failureAt);
    replies.push(new Response('raw-error-sentinel', { status: 503 }));
    const { result, saved, requests } = await intake(replies);
    assert.equal(result.errorCategory, 'transient-api-error');
    assert.equal(requests.length, failureAt + 1);
    assert.ok(saved.at(-1).records.length >= 2);
    assert.equal(result.recovery, 'reconcile-before-repeat');
    assert.ok(!JSON.stringify(result).includes('raw-error-sentinel'));
  }
});

test('J2 transport failure after dispatch is ambiguous and is not replayed', async () => {
  const { result, requests } = await intake([steps()[0], new Error('credential-sentinel private-response')]);
  assert.equal(result.errorCategory, 'ambiguous-write');
  assert.equal(result.recovery, 'reconcile-before-repeat');
  assert.equal(requests.length, 2);
  assert.ok(!JSON.stringify(result).includes('credential-sentinel'));
});

test('F4 runtime URL, image mismatch and missing inventory sink refuse writes', async () => {
  for (const extra of [
    { credentialProvider: () => ({ apiUrl: 'https://evil.test', key: 'credential-sentinel' }) },
    { image: Buffer.from('different-image') }, { saveInventory: undefined },
  ]) {
    const { result, requests } = await intake([], extra);
    assert.equal(result.status, 'Unverified');
    assert.equal(requests.length, 0);
  }
});

test('F4 unexpected transfer origin or secret-bearing headers stop before upload', async () => {
  for (const change of [
    { url: 'https://evil.test/upload' }, { headers: { Authorization: 'Bearer credential-sentinel' } },
    { url: 'https://uploads.jobtread.test/upload?key=credential-sentinel' },
  ]) {
    const replies = steps();
    Object.assign(replies[5].createUploadRequest.createdUploadRequest, change);
    const { result, requests } = await intake(replies);
    assert.equal(result.errorCategory, 'unsafe-transfer');
    assert.equal(requests.length, 6);
  }
});

test('F4 CLI stdout/stderr remain sanitized with credential and PII sentinels', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mr04-cli-'));
  try {
    const file = join(directory, 'plan.json');
    writeFileSync(file, JSON.stringify({ ...plan(), privateNotes: 'pii-sentinel', approvedBy: '' }));
    const run = spawnSync(process.execPath, ['scripts/jobtread-verification.mjs', '--plan', file], {
      encoding: 'utf8', env: { JOBTREAD_API_KEY: 'credential-sentinel', JOBTREAD_API_URL: 'https://private.test/?token=url-sentinel' },
    });
    assert.equal(run.status, 1);
    assert.equal(JSON.parse(run.stdout).errorCategory, 'invalid-plan');
    assert.ok(!`${run.stdout}${run.stderr}`.includes('sentinel'));
    writeFileSync(file, JSON.stringify(plan()));
    const valid = spawnSync(process.execPath, ['scripts/jobtread-verification.mjs', '--plan', file], { encoding: 'utf8', env: {} });
    assert.equal(valid.status, 0);
    assert.equal(JSON.parse(valid.stdout).stage, 'validated');
    const liveWithoutInventory = spawnSync(process.execPath, ['scripts/jobtread-verification.mjs', '--plan', file, '--live', '--scenario', 'intake'], {
      encoding: 'utf8', env: { JOBTREAD_API_KEY: 'credential-sentinel', JOBTREAD_API_URL: 'https://private.test/?token=url-sentinel' },
    });
    assert.equal(liveWithoutInventory.status, 1);
    assert.equal(JSON.parse(liveWithoutInventory.stdout).errorCategory, 'local-prerequisite-missing');
    assert.ok(!`${liveWithoutInventory.stdout}${liveWithoutInventory.stderr}`.includes('sentinel'));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
