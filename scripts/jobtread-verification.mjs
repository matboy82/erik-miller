import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { readFileSync, writeFileSync, renameSync, existsSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_URL = 'https://api.jobtread.com/pave';
const API_VERSION = 'bfb7d450125394d0bcd0cecf9c65573b09a56451';
const SCENARIOS = ['validate', 'intake', 'duplicate', 'cleanup'];
const KINDS = ['customer', 'location', 'job', 'upload', 'file'];
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const text = (value) => typeof value === 'string' && value.length > 0 && value.length <= 200;
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const isoCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= days[month - 1];
};
const safeOrigin = (value) => {
  try {
    const url = new URL(value);
    return url.origin === value && url.protocol === 'https:' && !url.username && !url.password
      && !url.hostname.includes(':') && !/^\d/.test(url.hostname)
      && url.hostname.includes('.') && !/\.(local|localhost|internal)$/.test(url.hostname)
      && url.origin !== new URL(API_URL).origin;
  } catch { return false; }
};

function validPlan(plan) {
  return plan?.version === 1 && plan.apiVersion === API_VERSION
    && plan.approvedBy === 'Matt' && isoCalendarDate(plan.approvedOn)
    && text(plan.organizationId) && ['isolated-synthetic', 'business-synthetic'].includes(plan.boundary)
    && /^MR04-[a-zA-Z0-9-]{1,19}$/.test(plan.runMarker || '')
    && plan.customFieldValues && typeof plan.customFieldValues === 'object' && !Array.isArray(plan.customFieldValues)
    && Object.entries(plan.customFieldValues).length > 0 && Object.entries(plan.customFieldValues).length <= 10
    && Object.entries(plan.customFieldValues).every(([id, value]) => /^[a-zA-Z0-9-]{1,100}$/.test(id)
      && (typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))
        || (typeof value === 'string' && value.length > 0 && value.length <= 500)))
    && /^[a-f0-9]{64}$/.test(plan.imageSha256 || '') && integer(plan.imageBytes, 1, 1024 * 1024)
    && Array.isArray(plan.transferOrigins) && plan.transferOrigins.length > 0
    && plan.transferOrigins.length <= 5 && plan.transferOrigins.every(safeOrigin)
    && plan.sideEffectsReviewed === true && plan.permissionsReviewed === true && plan.cleanupReviewed === true
    && plan.orphanUploadRetentionApproved === true
    && ['delete-records', 'retain-approved'].includes(plan.cleanup)
    && integer(plan.maxAttempts, 1, 2) && integer(plan.requestBudget, 1, 100)
    && integer(plan.timeoutMs, 1000, 30000);
}

// The public result is built from fixed labels and booleans, never vendor payloads.
export async function runProbe({ scenario = 'validate', plan, live = false, transport,
  credentialProvider, image, inventory, saveInventory } = {}) {
  const result = { scenario: SCENARIOS.includes(scenario) ? scenario : 'invalid',
    evidenceKind: 'Unverified', status: 'Unverified', stage: 'plan', checks: {},
    recordCounts: Object.fromEntries(KINDS.map((kind) => [kind, 0])),
    cleanup: 'not-started', errorCategory: null, recovery: 'none' };
  if (!SCENARIOS.includes(scenario)) { result.errorCategory = 'invalid-scenario'; return result; }
  if (!validPlan(plan)) { result.errorCategory = 'invalid-plan'; return result; }
  result.checks.plan = true;
  if (scenario === 'validate') { result.stage = 'validated'; return result; }
  if (!live) { result.errorCategory = 'live-mode-required'; return result; }
  const fail = (category) => { const error = new Error(category); error.safeCategory = category; throw error; };
  let state;
  let credential;
  let requestCount = 0;
  const fetcher = transport || globalThis.fetch;
  const persist = () => { try { saveInventory(state); } catch { fail('inventory-storage-failed'); } };
  const count = () => {
    for (const kind of KINDS) result.recordCounts[kind] = new Set(state.records.filter(r => r.kind === kind).map(r => r.id)).size;
  };
  const request = async (url, options, write = false) => {
    if (++requestCount > plan.requestBudget) fail('request-budget-exhausted');
    if (write) { state.pendingWrite = { stage: result.stage, attempt: state.attempts }; persist(); }
    result.evidenceKind = transport ? 'Simulation' : 'Live';
    let response;
    try { response = await fetcher(url, { ...options, redirect: 'error', signal: globalThis.AbortSignal.timeout(plan.timeoutMs) }); }
    catch { fail(write ? 'ambiguous-write' : 'transport-error'); }
    if (!response?.ok) fail(response?.status === 429 || response?.status >= 500 ? 'transient-api-error' : 'api-error');
    return response;
  };
  const api = async (query, write = false) => {
    const response = await request(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { $: { grantKey: credential.key, notify: false }, ...query } }) }, write);
    let data;
    try { data = await response.json(); } catch { fail(write ? 'ambiguous-write' : 'invalid-api-response'); }
    if (!data || typeof data !== 'object' || data.error || data.errors) fail('api-error');
    return data;
  };
  const remember = (kind, record) => {
    if (!text(record?.id)) fail('invalid-api-response');
    state.records.push({ kind, id: record.id, attempt: state.attempts, deleted: false });
    state.pendingWrite = null;
    persist(); count();
    return record.id;
  };
  const compare = (name, condition) => { result.checks[name] = !!condition; if (!condition) fail('comparison-failed'); };
  const transferUrl = (value) => {
    try {
      const url = new URL(value);
      if (!plan.transferOrigins.includes(url.origin) || url.username || url.password || url.hash
        || decodeURIComponent(url.href).includes(credential.key)) fail('unsafe-transfer');
      return url.href;
    } catch { fail('unsafe-transfer'); }
  };
  try {
    if (typeof credentialProvider !== 'function' || typeof saveInventory !== 'function') fail('local-prerequisite-missing');
    try { credential = await credentialProvider(); } catch { fail('credential-unavailable'); }
    if (credential?.apiUrl !== API_URL || typeof credential.key !== 'string' || !credential.key.length || credential.key.length > 4096) fail('invalid-credential-config');
    if (!image || image.byteLength !== plan.imageBytes || sha256(image) !== plan.imageSha256) fail('image-mismatch');
    if (scenario === 'duplicate' && plan.maxAttempts !== 2) fail('repeat-not-approved');
    if (inventory && (inventory.version !== 1 || inventory.organizationId !== plan.organizationId
      || inventory.runMarker !== plan.runMarker || inventory.imageSha256 !== plan.imageSha256
      || !integer(inventory.attempts, 0, plan.maxAttempts) || !Array.isArray(inventory.records)
      || inventory.records.length > plan.maxAttempts * 5
      || inventory.records.some(r => !KINDS.includes(r.kind) || !text(r.id) || !integer(r.attempt, 1, plan.maxAttempts)
        || typeof r.deleted !== 'boolean'))) fail('inventory-mismatch');
    state = inventory ? JSON.parse(JSON.stringify(inventory)) : { version: 1, organizationId: plan.organizationId,
      runMarker: plan.runMarker, imageSha256: plan.imageSha256, attempts: 0, records: [], pendingWrite: null };
    count();
    if (scenario !== 'cleanup' && (state.pendingWrite || state.records.length || state.attempts)) fail('existing-run-requires-reconciliation');
    if (scenario === 'cleanup' && (!inventory || state.pendingWrite)) fail('cleanup-requires-reconciliation');
    result.stage = 'boundary';
    const boundary = await api({ version: {}, organization: { $: { id: plan.organizationId }, id: {} } });
    if (boundary.organization?.id !== plan.organizationId) fail('boundary-mismatch');
    if (boundary.version !== plan.apiVersion) fail('schema-version-mismatch');
    result.checks.boundary = true;
    if (scenario === 'cleanup') {
      if (plan.cleanup === 'retain-approved') { result.cleanup = 'retained-approved'; result.stage = 'complete'; return result; }
      result.cleanup = 'incomplete';
      const resource = { customer: 'account', location: 'location', job: 'job', file: 'file' };
      for (const kind of ['file', 'job', 'location', 'customer']) {
        for (const record of state.records.filter(r => r.kind === kind && !r.deleted)) {
          if (record.deleted) continue;
          result.stage = `cleanup-${kind}`;
          const field = resource[kind];
          const selection = { id: {}, name: {} };
          if (kind === 'location') selection.account = { id: {}, organization: { id: {} } };
          else selection.organization = { id: {} };
          if (kind === 'file') selection.job = { id: {} };
          if (kind === 'job') selection.location = { id: {} };
          const before = (await api({ [field]: { $: { id: record.id }, ...selection } }))[field];
          const organizationId = kind === 'location' ? before?.account?.organization?.id : before?.organization?.id;
          if (!before || before.id !== record.id || organizationId !== plan.organizationId
            || before.name !== (kind === 'file' ? `${plan.runMarker}-photo.png` : plan.runMarker)) fail('cleanup-ownership-mismatch');
          const parentKind = { file: 'job', job: 'location', location: 'customer' }[kind];
          const parentId = { file: before.job?.id, job: before.location?.id, location: before.account?.id }[kind];
          if (parentKind && !state.records.some(r => r.kind === parentKind && r.id === parentId && r.attempt === record.attempt)) fail('cleanup-ownership-mismatch');
          const operation = `delete${field[0].toUpperCase()}${field.slice(1)}`;
          await api({ [operation]: { $: { id: record.id } } }, true);
          state.pendingWrite = null; persist();
          const after = await api({ [field]: { $: { id: record.id }, id: {} } });
          if (after[field] !== null) fail('cleanup-not-confirmed');
          for (const same of state.records.filter(r => r.kind === kind && r.id === record.id)) same.deleted = true;
          persist();
        }
      }
      result.cleanup = 'records-deleted-uploads-retained-approved';
      result.checks.cleanup = true; result.stage = 'complete'; result.status = 'Verified';
      return result;
    }
    const customerIds = [];
    for (let attempt = 0; attempt < (scenario === 'duplicate' ? 2 : 1); attempt++) {
      state.attempts++; persist();
      result.stage = 'customer';
      const customer = (await api({ createAccount: { $: { organizationId: plan.organizationId, name: plan.runMarker,
        type: 'customer', notify: false }, createdAccount: { id: {}, name: {}, organization: { id: {} } } } }, true)).createAccount;
      const customerId = remember('customer', customer?.createdAccount);
      customerIds.push(customerId);
      compare('customer', customer.createdAccount.name === plan.runMarker && customer.createdAccount.organization?.id === plan.organizationId);
      result.stage = 'location';
      const location = (await api({ createLocation: { $: { accountId: customerId, name: plan.runMarker, parseAddress: false },
        createdLocation: { id: {}, name: {}, account: { id: {} } } } }, true)).createLocation;
      const locationId = remember('location', location?.createdLocation);
      compare('location', location.createdLocation.name === plan.runMarker && location.createdLocation.account?.id === customerId);
      result.stage = 'job';
      const created = (await api({ createJob: { $: { locationId, name: plan.runMarker,
        description: `${plan.runMarker} synthetic capability verification`, customFieldValues: plan.customFieldValues },
        createdJob: { id: {}, name: {}, location: { id: {} }, organization: { id: {} } } } }, true)).createJob;
      const jobId = remember('job', created?.createdJob);
      compare('job', created.createdJob.name === plan.runMarker && created.createdJob.location?.id === locationId
        && created.createdJob.organization?.id === plan.organizationId);
      result.stage = 'record-check';
      const fields = new Map();
      let page = null;
      do {
        const query = { job: { $: { id: jobId }, id: {}, name: {}, organization: { id: {} },
          location: { id: {}, account: { id: {} } }, customFieldValues: { $: { size: 25, ...(page ? { page } : {}) },
            nextPage: {}, nodes: { id: {}, value: {}, customField: { id: {} } } } } };
        const job = (await api(query)).job;
        compare('relationship', job?.id === jobId && job.name === plan.runMarker && job.organization?.id === plan.organizationId
          && job.location?.id === locationId && job.location?.account?.id === customerId);
        if (!Array.isArray(job.customFieldValues?.nodes)) fail('invalid-api-response');
        for (const value of job.customFieldValues.nodes) fields.set(value.customField?.id, value.value);
        page = job.customFieldValues.nextPage;
        if (page !== null && !text(page)) fail('invalid-api-response');
      } while (page);
      compare('customFields', Object.entries(plan.customFieldValues).every(([id, value]) => fields.get(id) === value));
      result.stage = 'upload-request';
      const upload = (await api({ createUploadRequest: { $: { organizationId: plan.organizationId, size: image.byteLength, type: 'image/png' },
        createdUploadRequest: { id: {}, url: {}, method: {}, headers: {} } } }, true)).createUploadRequest?.createdUploadRequest;
      const uploadId = remember('upload', upload);
      const uploadUrl = transferUrl(upload.url);
      if (upload.method !== 'PUT' || !upload.headers || typeof upload.headers !== 'object' || Array.isArray(upload.headers)
        || Object.entries(upload.headers).some(([name, value]) => !text(value) || /authorization|cookie|host/i.test(name)
          || value.includes(credential.key))) fail('unsafe-transfer');
      result.stage = 'upload';
      await request(uploadUrl, { method: upload.method, headers: upload.headers, body: image }, true);
      state.pendingWrite = null; persist();
      result.stage = 'attachment';
      const attached = (await api({ createFile: { $: { name: `${plan.runMarker}-photo.png`, targetId: jobId, targetType: 'job', uploadRequestId: uploadId },
        createdFile: { id: {} } } }, true)).createFile;
      const fileId = remember('file', attached?.createdFile);
      result.stage = 'file-check';
      const file = (await api({ file: { $: { id: fileId }, id: {}, name: {}, organization: { id: {} }, job: { id: {} },
        url: { $: { original: true, download: true } } } })).file;
      compare('fileAssociation', file?.id === fileId && file.name === `${plan.runMarker}-photo.png`
        && file.organization?.id === plan.organizationId && file.job?.id === jobId);
      result.stage = 'photo';
      const photo = await request(transferUrl(file.url), { method: 'GET' });
      let bytes;
      try {
        const reader = photo.body.getReader();
        const chunks = []; let byteLength = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          byteLength += value.byteLength;
          if (byteLength > plan.imageBytes) { await reader.cancel(); break; }
          chunks.push(Buffer.from(value));
        }
        bytes = byteLength > plan.imageBytes ? Buffer.alloc(0) : Buffer.concat(chunks);
      } catch { fail('transport-error'); }
      compare('photoIdentity', bytes.byteLength === plan.imageBytes && sha256(bytes) === plan.imageSha256);
    }
    if (scenario === 'duplicate') result.duplicateOutcome = customerIds[0] === customerIds[1] ? 'reused-record' : 'distinct-records';
    result.status = 'Verified'; result.stage = 'complete';
    result.cleanup = plan.cleanup === 'retain-approved' ? 'retained-approved' : 'pending';
  } catch (error) {
    result.errorCategory = error.safeCategory || 'local-error';
    result.recovery = state?.records.length || state?.pendingWrite ? 'reconcile-before-repeat' : 'resolve-prerequisites';
    if (state?.pendingWrite) result.recovery = 'reconcile-before-repeat';
  }
  if (state) count();
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || (args.length === 1 && args[0] === '--help')) {
    console.log('Usage: node [--env-file=.env] scripts/jobtread-verification.mjs --plan <private.json> [--live --scenario intake|duplicate|cleanup --inventory <private.json>]');
    return;
  }
  try {
    const options = {};
    for (let index = 0; index < args.length; index++) {
      const arg = args[index];
      if (arg === '--live') options.live = true;
      else if (['--plan', '--scenario', '--inventory'].includes(arg) && args[index + 1]) options[arg.slice(2)] = args[++index];
      else throw new Error('invalid-arguments');
    }
    const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    for (const path of [options.plan, options.inventory].filter(Boolean)) {
      const actualPath = existsSync(path) ? realpathSync(path) : realpathSync(dirname(resolve(path)));
      const relativePath = relative(realpathSync(repoRoot), actualPath);
      if (relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath)) throw new Error('private-path-required');
    }
    const plan = JSON.parse(readFileSync(options.plan, 'utf8'));
    const image = readFileSync(new URL('./test/fixtures/jobtread-probe.png', import.meta.url));
    const inventory = options.inventory && existsSync(options.inventory) ? JSON.parse(readFileSync(options.inventory, 'utf8')) : undefined;
    const saveInventory = options.inventory ? (value) => {
      writeFileSync(`${options.inventory}.tmp`, JSON.stringify(value), { mode: 0o600 });
      renameSync(`${options.inventory}.tmp`, options.inventory);
    } : undefined;
    const result = await runProbe({ scenario: options.scenario, plan, live: options.live,
      image, inventory, saveInventory, credentialProvider: () => ({ apiUrl: process.env.JOBTREAD_API_URL, key: process.env.JOBTREAD_API_KEY }) });
    console.log(JSON.stringify(result));
    if (result.errorCategory) process.exitCode = 1;
  } catch { console.log(JSON.stringify({ status: 'Unverified', errorCategory: 'local-input-error' })); process.exitCode = 1; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();

