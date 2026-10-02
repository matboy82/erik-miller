import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/index.ts';

type IntakeRow = {
  receipt_id: string;
  idempotency_key: string;
  state: string;
  created_at: string;
  payload: string;
  delivery_step?: string;
  delivery_lease_until?: string | null;
  delivery_lease_token?: string | null;
  external_account_id?: string | null;
  external_location_id?: string | null;
  external_contact_id?: string | null;
  external_job_id?: string | null;
  attempts?: number;
  error_category?: string | null;
  payload_expires_at?: string;
  metadata_expires_at?: string;
};

class MemoryStatement {
  private values: unknown[] = [];
  private readonly db: MemoryDatabase;
  private readonly sql: string;

  constructor(db: MemoryDatabase, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  bind(...values: unknown[]): this {
    this.values = values;
    return this;
  }

  async first<T>(): Promise<T | null> {
    if (this.sql.includes('WHERE idempotency_key = ?')) {
      return (this.db.rows.find((row) => row.idempotency_key === this.values[0]) ?? null) as T | null;
    }
    if (this.sql.includes('WHERE receipt_id = ?')) {
      return (this.db.rows.find((row) => row.receipt_id === this.values[0]) ?? null) as T | null;
    }
    return null;
  }

  async all<T>(): Promise<{ results: T[] }> {
    return { results: [] };
  }

  async run(): Promise<{ success: boolean }> {
    if (this.db.failWrites) return { success: false };
    if (this.sql.includes('SET payload = NULL')) {
      let changes = 0;
      for (const row of this.db.rows) {
        if (row.payload && row.payload_expires_at && row.payload_expires_at <= String(this.values[0])) {
          row.payload = '';
          if (row.state !== 'delivered') {
            row.state = 'failed';
            row.error_category = 'retention_expired';
          }
          changes += 1;
        }
      }
      return { success: true, meta: { changes } } as { success: boolean };
    }
    if (this.sql.includes('SET state = \'processing\', delivery_step = ?1')) {
      const [step, leaseUntil, token, updatedAt, receiptId, expected] = this.values as [string, string, string, string, string, string];
      const row = this.db.rows.find((item) => item.receipt_id === receiptId);
      if (!row || (row.delivery_step ?? 'queued') !== expected) return { success: true, meta: { changes: 0 } } as { success: boolean };
      row.state = 'processing';
      row.delivery_step = step;
      row.delivery_lease_until = leaseUntil;
      row.delivery_lease_token = token;
      row.updated_at = updatedAt;
      return { success: true, meta: { changes: 1 } } as { success: boolean };
    }
    if (this.sql.includes('SET attempts = attempts + 1')) {
      const row = this.db.rows.find((item) => item.receipt_id === this.values[1]);
      if (row) row.attempts = (row.attempts ?? 0) + 1;
    }
    if (this.sql.includes('error_category = CASE WHEN delivery_step LIKE')) {
      const row = this.db.rows.find((item) => item.receipt_id === this.values[1]);
      if (row) {
        row.state = 'failed';
        row.error_category = row.delivery_step?.endsWith('_writing') ? 'external_result_unknown' : 'delivery_dead_lettered';
      }
    }
    if (this.sql.includes('SET state = ?')) {
      const row = this.db.rows.find((item) => item.receipt_id === this.values.at(-1));
      if (row) {
        row.state = String(this.values[0]);
        row.error_category = String(this.values[1] ?? '') || null;
      }
    }
    if (this.sql.includes("SET state = 'delayed'")) {
      const row = this.db.rows.find((item) => item.receipt_id === this.values[0] || item.receipt_id === this.values.at(-1));
      if (row) {
        row.state = 'delayed';
        row.error_category = String(this.values[1] ?? '');
      }
    }
    if (this.sql.includes("SET state = 'failed'") && !this.sql.includes('error_category = CASE WHEN delivery_step LIKE')) {
      const row = this.db.rows.find((item) => item.receipt_id === this.values[2] || item.receipt_id === this.values[1] || item.receipt_id === this.values.at(-1));
      if (row) {
        row.state = 'failed';
        row.error_category = String(this.values[1] ?? '');
      }
    }
    if (this.sql.includes('INSERT INTO intake')) {
      const receipt_id = this.values[0] as string;
      const idempotency_key = this.values[1] as string;
      const created_at = this.values[2] as string;
      const payload = this.values[5] as string;
      if (!this.db.rows.some((row) => row.idempotency_key === idempotency_key)) {
        this.db.rows.push({ receipt_id, idempotency_key, state: 'accepted', created_at, payload, delivery_step: 'queued', delivery_lease_until: null });
      }
    }
    return { success: true, meta: { changes: 1 } } as { success: boolean };
  }
}

class MemoryDatabase {
  rows: IntakeRow[] = [];
  failWrites = false;
  prepare(sql: string): MemoryStatement {
    return new MemoryStatement(this, sql);
  }
}

function testEnv(db = new MemoryDatabase(), options: { queueFails?: boolean } = {}) {
  const sent: string[] = [];
  const env = {
    INTAKE_ENABLED: 'true',
    INTAKE_DB: db,
    INTAKE_QUEUE: {
      send: async (message: string) => {
        if (options.queueFails) throw new Error('queue unavailable');
        sent.push(message);
      },
    },
  } as unknown as Parameters<typeof worker.fetch>[1];
  return { env, db, sent };
}

const validPayload = {
  name: 'Synthetic homeowner',
  email: 'demo@example.invalid',
  message: 'This is a synthetic test inquiry.',
};
const key = '11111111-1111-4111-8111-111111111111';

function contactRequest(body: unknown, idempotencyKey = key) {
  return new Request('https://worker.test/intake/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(body),
  });
}

test('valid inquiry is durably stored and queued before returning a safe receipt', async () => {
  const { env, db, sent } = testEnv();
  const response = await worker.fetch(contactRequest(validPayload), env);
  const body = await response.json() as { receiptId: string; state: string };

  assert.equal(response.status, 202);
  assert.match(body.receiptId, /^[a-f0-9-]{36}$/);
  assert.equal(body.state, 'accepted');
  assert.equal(db.rows.length, 1);
  assert.deepEqual(sent, [body.receiptId]);
  assert.equal(JSON.stringify(body).includes(validPayload.email), false);
});

test('intake is disabled by default and stores no submission', async () => {
  const { env, db, sent } = testEnv();
  delete (env as unknown as Record<string, unknown>).INTAKE_ENABLED;
  const response = await worker.fetch(contactRequest(validPayload), env);

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'intake_disabled' });
  assert.equal(db.rows.length, 0);
  assert.deepEqual(sent, []);
});

test('invalid fields and malformed JSON never write or enqueue', async () => {
  const { env, db, sent } = testEnv();
  const invalid = await worker.fetch(contactRequest({ ...validPayload, phone: '555-0100' }), env);
  const malformed = await worker.fetch(new Request('https://worker.test/intake/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: '{',
  }), env);

  assert.equal(invalid.status, 400);
  assert.deepEqual(await invalid.json(), { error: 'validation_failed', fields: ['contact'] });
  assert.equal(malformed.status, 400);
  assert.equal(db.rows.length, 0);
  assert.deepEqual(sent, []);
});

test('retry with the same idempotency key returns the same receipt without creating another record', async () => {
  const { env, db, sent } = testEnv();
  const first = await worker.fetch(contactRequest(validPayload), env);
  const repeated = await worker.fetch(contactRequest(validPayload), env);

  assert.equal(first.status, 202);
  assert.equal(repeated.status, 202);
  assert.equal((await repeated.json() as { receiptId: string }).receiptId,
    (await first.json() as { receiptId: string }).receiptId);
  assert.equal(db.rows.length, 1);
  assert.equal(sent.length, 2);
});

test('reusing an idempotency key for different content is rejected', async () => {
  const { env, db, sent } = testEnv();
  await worker.fetch(contactRequest(validPayload), env);
  const changed = await worker.fetch(contactRequest({ ...validPayload, message: 'Different inquiry.' }), env);

  assert.equal(changed.status, 409);
  assert.deepEqual(await changed.json(), { error: 'idempotency_conflict' });
  assert.equal(db.rows.length, 1);
  assert.equal(sent.length, 1);
});

test('field size and unknown-field limits return safe errors', async () => {
  const { env, db, sent } = testEnv();
  const tooLong = await worker.fetch(contactRequest({ ...validPayload, message: 'x'.repeat(5001) }), env);
  const unknown = await worker.fetch(contactRequest({ ...validPayload, address: 'sensitive' }), env);

  assert.equal(tooLong.status, 400);
  assert.equal(unknown.status, 400);
  assert.equal((await unknown.text()).includes('sensitive'), false);
  assert.equal(db.rows.length, 0);
  assert.deepEqual(sent, []);
});

test('database or queue acceptance failure never claims receipt', async () => {
  const database = new MemoryDatabase();
  database.failWrites = true;
  const blocked = testEnv(database);
  const dbResponse = await worker.fetch(contactRequest(validPayload), blocked.env);
  assert.equal(dbResponse.status, 503);
  assert.deepEqual(blocked.sent, []);

  const queueBlocked = testEnv(new MemoryDatabase(), { queueFails: true });
  const queueResponse = await worker.fetch(contactRequest(validPayload), queueBlocked.env);
  assert.equal(queueResponse.status, 503);
  assert.equal((await queueResponse.json() as { error: string }).error, 'intake_unavailable');
});

test('unconfigured JobTread delivery is delayed and returned to the bounded queue retry path', async () => {
  const { env, db } = testEnv();
  const receiptId = '33333333-3333-4333-8333-333333333333';
  db.rows.push({ receipt_id: receiptId, idempotency_key: key, state: 'accepted', created_at: new Date().toISOString(), payload: JSON.stringify(validPayload), delivery_step: 'queued' });
  let retries = 0;
  let acknowledgements = 0;
  await worker.queue({ messages: [{
    body: receiptId,
    ack: () => { acknowledgements += 1; },
    retry: () => { retries += 1; },
  }] } as unknown as MessageBatch<string>, env);

  assert.equal(db.rows[0].state, 'delayed');
  assert.equal(retries, 1);
  assert.equal(acknowledgements, 0);
});

test('ambiguous JobTread write is stopped for reconciliation instead of blindly retried', async () => {
  const { env, db } = testEnv();
  const receiptId = '44444444-4444-4444-8444-444444444444';
  db.rows.push({ receipt_id: receiptId, idempotency_key: key, state: 'accepted', created_at: new Date().toISOString(), payload: JSON.stringify(validPayload), delivery_step: 'queued' });
  Object.assign(env, {
    JOBTREAD_API_KEY: 'synthetic-test-key',
    JOBTREAD_ORGANIZATION_ID: 'synthetic-organization',
    JOBTREAD_EMAIL_CUSTOM_FIELD_ID: 'email-field',
    JOBTREAD_PHONE_CUSTOM_FIELD_ID: 'phone-field',
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('simulated ambiguous transport result'); };
  let retries = 0;
  let acknowledgements = 0;
  try {
    await worker.queue({ messages: [{
      body: receiptId,
      ack: () => { acknowledgements += 1; },
      retry: () => { retries += 1; },
    }] } as unknown as MessageBatch<string>, env);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(db.rows[0].state, 'failed');
  assert.equal(db.rows[0].delivery_step, 'account_writing');
  assert.equal(db.rows[0].error_category, 'external_result_unknown');
  assert.equal(retries, 0);
  assert.equal(acknowledgements, 1);
});

test('dead-letter consumer marks delivery failed and acknowledges the opaque receipt', async () => {
  const { env, db } = testEnv();
  const receiptId = '55555555-5555-4555-8555-555555555555';
  db.rows.push({ receipt_id: receiptId, idempotency_key: key, state: 'delayed', created_at: new Date().toISOString(), payload: JSON.stringify(validPayload), delivery_step: 'queued' });
  let retries = 0;
  let acknowledgements = 0;
  await worker.queue({
    queue: 'miller-intake-dead-letter',
    messages: [{ body: receiptId, ack: () => { acknowledgements += 1; }, retry: () => { retries += 1; } }],
  } as unknown as MessageBatch<string>, env);

  assert.equal(db.rows[0].state, 'failed');
  assert.equal(db.rows[0].error_category, 'delivery_dead_lettered');
  assert.equal(retries, 0);
  assert.equal(acknowledgements, 1);
});

test('scheduled retention removes expired payloads but preserves safe delivery metadata', async () => {
  const { env, db } = testEnv();
  db.rows.push({
    receipt_id: '66666666-6666-4666-8666-666666666666',
    idempotency_key: key,
    state: 'delivered',
    created_at: '2026-01-01T00:00:00.000Z',
    payload: JSON.stringify(validPayload),
    payload_expires_at: '2026-01-02T00:00:00.000Z',
    metadata_expires_at: '2026-04-01T00:00:00.000Z',
    delivery_step: 'verified',
  });
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    await worker.scheduled({} as ScheduledController, env);
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(db.rows[0].payload, '');
  assert.equal(db.rows[0].state, 'delivered');
  assert.equal(JSON.stringify(db.rows[0]).includes(validPayload.email), false);
});

test('health endpoint keeps existing scaffold semantics', async () => {
  const response = await worker.fetch(new Request('https://worker.test/health'));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok', service: 'miller-remodeling-intake', stage: 'scaffold',
  });
});

test('operator status stays unavailable without configured Access identity', async () => {
  const { env } = testEnv();
  const response = await worker.fetch(new Request(`https://worker.test/operator/intake/${key}`), env);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'operator_unauthorized' });
});

test('operator status accepts a signed allowlisted Access token and omits stored payload', async () => {
  const { env, db } = testEnv();
  const receiptId = '22222222-2222-4222-8222-222222222222';
  db.rows.push({
    receipt_id: receiptId,
    idempotency_key: key,
    state: 'delayed',
    created_at: '2026-10-02T00:00:00.000Z',
    payload: JSON.stringify(validPayload),
  });
  Object.assign(env, {
    ACCESS_TEAM_DOMAIN: 'miller-test.cloudflareaccess.com',
    ACCESS_AUD: 'test-audience',
    OPERATOR_EMAILS: 'erik@example.invalid',
  });

  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey) as JsonWebKey & { kid?: string };
  jwk.kid = 'test-key';
  const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encode = (value: unknown) => base64url(new TextEncoder().encode(JSON.stringify(value)));
  const header = encode({ alg: 'RS256', kid: 'test-key' });
  const claims = encode({ iss: 'https://miller-test.cloudflareaccess.com', aud: ['test-audience'], exp: Math.floor(Date.now() / 1000) + 60, email: 'Erik@example.invalid' });
  const content = `${header}.${claims}`;
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(content)));
  const token = `${content}.${base64url(signature)}`;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }), { status: 200 });
  try {
    const response = await worker.fetch(new Request(`https://worker.test/operator/intake/${receiptId}`, {
      headers: { 'Cf-Access-Jwt-Assertion': token },
    }), env);
    const body = await response.json() as Record<string, unknown>;
    assert.equal(response.status, 200);
    assert.equal(body.receiptId, receiptId);
    assert.equal(body.checkedBy, 'erik@example.invalid');
    assert.equal('payload' in body, false);
    assert.equal(JSON.stringify(body).includes(validPayload.email), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
