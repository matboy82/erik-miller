import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../src/index.ts';
import { decodeProject } from '../src/project.ts';
import { validBooking, recordBooking } from '../src/booking.ts';
import { syncCalendar, calendarTime } from '../src/calendar.ts';
import { googleAuthorization, refreshToken } from '../src/google-auth.ts';

class Database {
  raw = new DatabaseSync(':memory:');
  constructor() {
    this.raw.exec('PRAGMA foreign_keys = ON');
    for (const file of ['0001_intake.sql', '0002_photos.sql', '0003_bookings.sql', '0004_calendar_sync.sql']) this.raw.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), 'utf8'));
  }
  prepare(sql: string) {
    const statement = this.raw.prepare(sql);
    let values: (string | number | null)[] = [];
    const bound = () => Object.fromEntries(values.map((value, index) => [String(index + 1), value]));
    const api = {
      bind(...input: (string | number | null)[]) { values = input; return api; },
      async first() { return (sql.includes('?1') ? statement.get(bound()) : statement.get(...values)) ?? null; },
      async all() { return { results: sql.includes('?1') ? statement.all(bound()) : statement.all(...values) }; },
      async run() { const result = sql.includes('?1') ? statement.run(bound()) : statement.run(...values); return { success: true, meta: { changes: Number(result.changes) } }; },
    };
    return api;
  }
  async batch(statements: ReturnType<Database['prepare']>[]) {
    this.raw.exec('BEGIN');
    try { const result = []; for (const statement of statements) result.push(await statement.run()); this.raw.exec('COMMIT'); return result; }
    catch (error) { this.raw.exec('ROLLBACK'); throw error; }
  }
}

const key = '22222222-2222-4222-8222-222222222222';
const project = { projectType: 'Kitchen', location: 'Eagle', timeline: 'Still exploring', budget: 'Still estimating', description: 'Synthetic kitchen remodel', experience: 'No', referralSource: 'Search' };
const lead = { name: 'Synthetic homeowner', email: 'synthetic@example.invalid', project, photos: [] as { type: string; data: string }[] };
const image = readFileSync(new URL('../../../scripts/test/fixtures/jobtread-probe.png', import.meta.url));
const photo = { type: 'image/png', data: image.toString('base64') };
function setup() {
  const db = new Database();
  const sent: string[] = [];
  const objects = new Map<string, { bytes: Uint8Array; uploaded: Date }>();
  const env = {
    INTAKE_ENABLED: 'true', INTAKE_MODE: 'synthetic', INTAKE_DB: db, INTAKE_QUEUE: { send: async (id: string) => { sent.push(id); } },
    ALLOWED_ORIGINS: 'https://site.test', JOBTREAD_API_KEY: 'synthetic-key', JOBTREAD_ORGANIZATION_ID: 'org',
    JOBTREAD_EMAIL_CUSTOM_FIELD_ID: 'email', JOBTREAD_PHONE_CUSTOM_FIELD_ID: 'phone', JOBTREAD_TRANSFER_ORIGINS: 'https://files.test',
    INTAKE_PHOTOS: {
      put: async (id: string, bytes: Uint8Array) => { objects.set(id, { bytes, uploaded: new Date() }); },
      get: async (id: string) => objects.has(id) ? { arrayBuffer: async () => objects.get(id)!.bytes.buffer } : null,
      delete: async (ids: string | string[]) => { for (const id of Array.isArray(ids) ? ids : [ids]) objects.delete(id); },
      list: async () => ({ objects: Array.from(objects, ([key, value]) => ({ key, uploaded: value.uploaded })), truncated: false }),
    },
  } as unknown as Parameters<typeof worker.fetch>[1];
  return { db, env, sent, objects };
}
function request(body: unknown, origin?: string, endpoint = 'project') {
  return new Request(`https://worker.test/intake/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key, ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify(body) });
}

test('project acceptance stores a complete brief and private photo descriptors atomically; retry reuses receipt', async () => {
  const { db, env, objects, sent } = setup();
  const response = await worker.fetch(request({ ...lead, photos: [photo] }, 'https://site.test'), env);
  assert.equal(response.status, 202);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://site.test');
  const receipt = await response.json() as { receiptId: string };
  const row = db.raw.prepare('SELECT * FROM intake_submissions').get()!;
  const payload = JSON.parse(String(row.payload));
  assert.deepEqual(payload.project, project);
  assert.equal(payload.fit, 'needs-review');
  assert.match(payload.message, /Synthetic kitchen remodel/);
  assert.equal(payload.photos[0].data, undefined);
  assert.equal(objects.size, 1);
  assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM intake_photos').get()!.n, 1);
  const retry = await worker.fetch(request({ ...lead, photos: [photo] }), env);
  assert.equal((await retry.json() as { receiptId: string }).receiptId, receipt.receiptId);
  assert.deepEqual(sent, [receipt.receiptId, receipt.receiptId]);
  assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM intake_submissions').get()!.n, 1);
  assert.equal((await worker.fetch(request({ ...lead, project: { ...project, location: 'Boise' }, photos: [photo] }), env)).status, 409);
  assert.equal(objects.size, 1);
});

test('invalid project, spoofed image, too many photos, missing storage, and foreign origins cannot be accepted', async () => {
  const { db, env, objects } = setup();
  for (const body of [{ ...lead, project: {} }, { ...lead, photos: [{ type: 'image/png', data: 'dGV4dA==' }] }, { ...lead, photos: [photo, photo, photo, photo] }]) assert.equal((await worker.fetch(request(body), env)).status, 400);
  assert.equal((await worker.fetch(request(lead, 'https://foreign.test'), env)).status, 403);
  assert.equal(objects.size, 0);
  assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM intake_submissions').get()!.n, 0);
  delete env!.INTAKE_PHOTOS;
  assert.equal((await worker.fetch(request({ ...lead, photos: [photo] }), env)).status, 503);
});

test('preflight admits only the configured site and required headers', async () => {
  const { env } = setup();
  const result = await worker.fetch(new Request('https://worker.test/intake/project', { method: 'OPTIONS', headers: { Origin: 'https://site.test' } }), env);
  assert.equal(result.status, 204);
  assert.match(result.headers.get('Access-Control-Allow-Headers')!, /Idempotency-Key/);
  assert.equal((await worker.fetch(new Request('https://worker.test/intake/contact', { method: 'OPTIONS', headers: { Origin: 'https://foreign.test' } }), env)).status, 403);
});

test('live intake fails closed without security verification and validates the challenge hostname', async () => {
  const { db, env } = setup();
  delete env!.INTAKE_MODE;
  assert.equal((await worker.fetch(request(lead), env)).status, 503);
  env!.TURNSTILE_SECRET_KEY = 'synthetic-turnstile-secret';
  assert.equal((await worker.fetch(request(lead), env)).status, 400);
  const original = globalThis.fetch;
  let hostname = 'foreign.test';
  globalThis.fetch = (async () => Response.json({ success: true, hostname })) as typeof fetch;
  try {
    assert.equal((await worker.fetch(request({ ...lead, turnstileToken: 'token' }), env)).status, 400);
    assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM intake_submissions').get()!.n, 0);
    hostname = 'site.test';
    const result = await worker.fetch(request({ ...lead, turnstileToken: 'token' }), env);
    assert.equal(result.status, 202);
    assert.equal(String(db.raw.prepare('SELECT payload FROM intake_submissions').get()!.payload).includes('token'), false);
  } finally { globalThis.fetch = original; }
});

test('a browser retry can recover its receipt during ambiguous delivery without dispatching another write', async () => {
  const { db, env, sent } = setup();
  const original = await worker.fetch(request(lead), env);
  const receipt = await original.json() as { receiptId: string };
  db.raw.exec("UPDATE intake_submissions SET state = 'failed', delivery_step = 'account_writing'");
  const retried = await worker.fetch(request(lead), env);
  assert.equal(retried.status, 202);
  assert.equal((await retried.json() as { receiptId: string }).receiptId, receipt.receiptId);
  assert.equal(sent.length, 1);
  assert.equal(db.raw.prepare('SELECT state FROM intake_submissions').get()!.state, 'failed');
});

function vendor(failFile = false) {
  const calls: string[] = [];
  let message = '';
  let accountName = '';
  let locationName = '';
  const transport = async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url).startsWith('https://files.test')) {
      assert.equal(init?.redirect, 'manual', 'Workers must reject redirects through response status without following them');
      return new Response(init?.method === 'PUT' ? null : image, { status: 200 });
    }
    const query = JSON.parse(String(init!.body)).query;
    const operation = Object.keys(query).find((key) => key !== '$')!;
    calls.push(operation);
    const result: Record<string, unknown> = {};
    if (operation === 'createAccount') { accountName = query.createAccount.$.name; result.createAccount = { createdAccount: { id: 'account' } }; }
    else if (operation === 'account') result.account = { id: 'account', name: accountName, organization: { id: 'org' } };
    else if (operation === 'createLocation') { locationName = query.createLocation.$.name; result.createLocation = { createdLocation: { id: 'location', account: { id: 'account' } } }; }
    else if (operation === 'location') result.location = { id: 'location', name: locationName, account: { id: 'account', organization: { id: 'org' } } };
    else if (operation === 'createContact') result.createContact = { createdContact: { id: 'contact' } };
    else if (operation === 'createJob') { message = query.createJob.$.description; result.createJob = { createdJob: { id: 'job', location: { id: 'location', account: { id: 'account' } } } }; }
    else if (operation === 'contact') {
      result.contact = { id: 'contact', account: { id: 'account' }, customFieldValues: { nodes: [{ customField: { id: 'email' }, value: lead.email }] } };
      result.job = { id: 'job', description: message, location: { id: 'location', account: { id: 'account' } } };
    } else if (operation === 'createUploadRequest') result.createUploadRequest = { createdUploadRequest: { id: 'upload' } };
    else if (operation === 'uploadRequest') result.uploadRequest = { url: 'https://files.test/upload', method: 'PUT', headers: { 'Content-Type': 'image/png' } };
    else if (operation === 'createFile') {
      if (failFile) throw new Error('synthetic transport failure');
      result.createFile = { createdFile: { id: 'file' } };
    } else if (operation === 'file') result.file = { id: 'file', job: { id: 'job' }, url: 'https://files.test/original' };
    else throw new Error('Unexpected synthetic operation');
    return Response.json(result);
  };
  return { calls, transport };
}
async function consume(id: string, env: Parameters<typeof worker.fetch>[1]) {
  await worker.queue({ queue: 'miller-intake-delivery', messages: [{ body: id, ack() {}, retry() {} }] } as unknown as Parameters<typeof worker.queue>[0], env!);
}

test('complete project delivery verifies customer/contact/job links, original photo identity and staging deletion', async () => {
  const { db, env, objects } = setup();
  const response = await worker.fetch(request({ ...lead, photos: [photo] }), env);
  const { receiptId } = await response.json() as { receiptId: string };
  const original = globalThis.fetch;
  const mock = vendor(); globalThis.fetch = mock.transport as typeof fetch;
  try {
    await consume(receiptId, env);
    assert.equal(db.raw.prepare('SELECT state FROM intake_submissions').get()!.state, 'delivered');
    assert.equal(db.raw.prepare('SELECT phase FROM intake_photos').get()!.phase, 'verified');
    assert.equal(objects.size, 0);
    const count = mock.calls.length;
    await consume(receiptId, env);
    assert.equal(mock.calls.length, count);
  } finally { globalThis.fetch = original; }
});

test('unknown photo attachment outcome stops replay and preserves bytes for reconciliation', async () => {
  const { db, env, objects } = setup();
  const response = await worker.fetch(request({ ...lead, photos: [photo] }), env);
  const { receiptId } = await response.json() as { receiptId: string };
  const original = globalThis.fetch;
  const mock = vendor(true); globalThis.fetch = mock.transport as typeof fetch;
  try {
    await consume(receiptId, env);
    const row = db.raw.prepare('SELECT state, delivery_step FROM intake_submissions').get()!;
    assert.equal(row.state, 'failed');
    assert.equal(row.delivery_step, 'photo_0_file_writing');
    assert.equal(objects.size, 1);
    const count = mock.calls.length;
    await consume(receiptId, env);
    assert.equal(mock.calls.length, count);
  } finally { globalThis.fetch = original; }
});

test('retention deletes expired photo objects before removing lead payload', async () => {
  const { db, env, objects } = setup();
  await worker.fetch(request({ ...lead, photos: [photo] }), env);
  db.raw.exec("UPDATE intake_submissions SET payload_expires_at = '2000-01-01T00:00:00.000Z'");
  await worker.scheduled({} as Parameters<typeof worker.scheduled>[0], env!);
  assert.equal(objects.size, 0);
  assert.equal(db.raw.prepare('SELECT payload FROM intake_submissions').get()!.payload, null);
});

test('booking requires valid times, verified lead and readback; a repeated event creates one task', async () => {
  const { db, env } = setup();
  const input = { eventId: 'synthetic-google-event', date: '2026-10-20', start: '10:00', end: '10:30' };
  assert.equal(validBooking(input), true);
  assert.equal(validBooking({ ...input, date: '2026-02-30' }), false);
  assert.equal(validBooking({ ...input, end: '09:30' }), false);
  const response = await worker.fetch(request(lead), env);
  const { receiptId } = await response.json() as { receiptId: string };
  const d1 = db as unknown as D1Database;
  assert.equal((await recordBooking(receiptId, input, d1, async () => { throw new Error('must not dispatch'); })).status, 409);
  db.raw.exec("UPDATE intake_submissions SET state = 'delivered', external_job_id = 'job'");
  let creates = 0;
  const call = async (operation: Record<string, unknown>) => {
    if (operation.createTask) { creates++; return { createTask: { createdTask: { id: 'task' } } }; }
    return { task: { id: 'task', job: { id: 'job' }, startDate: input.date, endDate: input.date, startTime: '10:00:00', endTime: '10:30:00' } };
  };
  assert.equal((await recordBooking(receiptId, input, d1, call)).status, 200);
  assert.equal((await recordBooking(receiptId, input, d1, call)).status, 200);
  assert.equal(creates, 1);
});

test('project decoder retains a long description without silently truncating it', async () => {
  const decoded = await decodeProject({ ...lead, project: { ...project, description: 'x'.repeat(5000) } }, key);
  assert.equal(decoded.project.description.length, 5000);
  assert.ok(decoded.message.length > 5000);
});

test('automatic Google sync creates, reschedules and cancels one associated task, including minimal deletion events', async () => {
  const { db, env } = setup();
  const response = await worker.fetch(request(lead), env);
  const { receiptId } = await response.json() as { receiptId: string };
  db.raw.exec("UPDATE intake_submissions SET state = 'delivered', external_job_id = 'job'");
  Object.assign(env!, { BOOKING_SYNC_ENABLED: 'true', GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: 'secret', GOOGLE_REFRESH_TOKEN: 'refresh', GOOGLE_BOOKING_CALENDAR_ID: 'booking-calendar' });
  let event: Record<string, unknown> | undefined = { id: 'google-event', description: `Project reference: ${receiptId}`, status: 'confirmed', start: { dateTime: '2026-10-20T10:00:00-06:00' }, end: { dateTime: '2026-10-20T10:30:00-06:00' } };
  const original = globalThis.fetch;
  const calls: string[] = [];
  let task: Record<string, unknown> | null = null;
  let tick = 0;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    assert.equal(init?.redirect, 'manual');
    if (String(url).startsWith('https://oauth2.googleapis.com')) return Response.json({ access_token: 'synthetic-google-token' });
    assert.match(String(url), /^https:\/\/www.googleapis.com\/calendar\/v3\/calendars\/booking-calendar\/events/);
    return Response.json({ items: event ? [event] : [], nextSyncToken: `tick-${++tick}` });
  }) as typeof fetch;
  const call = async (operation: Record<string, unknown>) => {
    if (operation.createTask) {
      calls.push('create'); const input = (operation.createTask as { $: Record<string, unknown> }).$;
      task = { id: 'task', job: { id: 'job' }, ...input };
      return { createTask: { createdTask: { id: 'task' } } };
    }
    if (operation.updateTask) { calls.push('update'); task = { ...task, ...(operation.updateTask as { $: Record<string, unknown> }).$ }; return {}; }
    if (operation.deleteTask) { calls.push('delete'); task = null; return {}; }
    return { task };
  };
  try {
    await syncCalendar(env!, call);
    assert.deepEqual(calls, ['create']);
    assert.equal(db.raw.prepare('SELECT phase FROM intake_bookings').get()!.phase, 'verified');
    event = undefined;
    await syncCalendar(env!, call);
    assert.deepEqual(calls, ['create']);
    event = { id: 'google-event', description: `Project reference: ${receiptId}`, status: 'confirmed', start: { dateTime: '2026-10-20T12:00:00-06:00' }, end: { dateTime: '2026-10-20T12:30:00-06:00' } };
    await syncCalendar(env!, call);
    assert.deepEqual(calls, ['create', 'update']);
    event = { id: 'google-event', status: 'cancelled' };
    await syncCalendar(env!, call);
    assert.deepEqual(calls, ['create', 'update', 'delete']);
    assert.equal(db.raw.prepare('SELECT phase FROM intake_bookings').get()!.phase, 'verified');
    assert.notEqual(db.raw.prepare('SELECT delivered_at FROM calendar_booking_events').get()!.delivered_at, null);
  } finally { globalThis.fetch = original; }
});

test('Google changes are saved while lead delivery is pending and ambiguous task creation is not repeated', async () => {
  const { db, env } = setup();
  const response = await worker.fetch(request(lead), env);
  const { receiptId } = await response.json() as { receiptId: string };
  Object.assign(env!, { BOOKING_SYNC_ENABLED: 'true', GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: 'secret', GOOGLE_REFRESH_TOKEN: 'refresh', GOOGLE_BOOKING_CALENDAR_ID: 'booking-calendar' });
  const original = globalThis.fetch;
  let first = true;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    assert.equal(init?.redirect, 'manual');
    if (String(url).startsWith('https://oauth2.googleapis.com')) return Response.json({ access_token: 'synthetic-google-token' });
    const items = first ? [{ id: 'event', description: receiptId, start: { dateTime: '2026-10-20T10:00:00-06:00' }, end: { dateTime: '2026-10-20T10:30:00-06:00' } }] : [];
    first = false;
    return Response.json({ items, nextSyncToken: 'sync' });
  }) as typeof fetch;
  let writes = 0;
  const call = async () => { writes++; throw new Error('synthetic unknown result'); };
  try {
    await syncCalendar(env!, call);
    assert.equal(writes, 0);
    assert.equal(db.raw.prepare('SELECT error_category FROM calendar_booking_events').get()!.error_category, 'delivery_required');
    db.raw.exec("UPDATE intake_submissions SET state = 'delivered', external_job_id = 'job'");
    await syncCalendar(env!, call);
    assert.equal(writes, 1);
    await syncCalendar(env!, call);
    assert.equal(writes, 1);
    assert.equal(db.raw.prepare('SELECT phase FROM intake_bookings').get()!.phase, 'writing');
  } finally { globalThis.fetch = original; }
});

test('Google timezone conversion preserves Denver date and daylight-saving offsets', () => {
  assert.deepEqual(calendarTime('2026-10-20T16:00:00Z'), { date: '2026-10-20', time: '10:00' });
  assert.deepEqual(calendarTime('2026-12-20T17:00:00Z'), { date: '2026-12-20', time: '10:00' });
  assert.deepEqual(calendarTime('2026-10-21T01:00:00Z'), { date: '2026-10-20', time: '19:00' });
  assert.throws(() => calendarTime('2026-10-20T10:00:00'));
});

test('Google consent state is bound to operator and single use; refresh tokens are encrypted at rest', async () => {
  const { db, env } = setup();
  Object.assign(env!, { GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: 'secret', GOOGLE_OAUTH_REDIRECT_URI: 'https://worker.test/operator/google/callback', GOOGLE_TOKEN_ENCRYPTION_KEY: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64') });
  const connected = await googleAuthorization(new Request('https://worker.test/operator/google/connect'), env!, 'operator@example.invalid');
  assert.equal(connected.status, 302);
  const authorize = new URL(connected.headers.get('Location')!);
  assert.equal(authorize.searchParams.get('scope'), 'https://www.googleapis.com/auth/calendar.events.readonly');
  const state = authorize.searchParams.get('state');
  const callback = new Request(`https://worker.test/operator/google/callback?code=synthetic-code&state=${state}`);
  const original = globalThis.fetch;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    assert.equal(init?.redirect, 'manual');
    return Response.json({ refresh_token: 'synthetic-refresh-token', scope: 'https://www.googleapis.com/auth/calendar.events.readonly' });
  }) as typeof fetch;
  try {
    assert.equal((await googleAuthorization(callback, env!, 'operator@example.invalid')).status, 303);
    const stored = String(db.raw.prepare("SELECT value FROM integration_state WHERE name = 'google-refresh-token'").get()!.value);
    assert.equal(stored.includes('synthetic-refresh-token'), false);
    assert.equal(await refreshToken(env!), 'synthetic-refresh-token');
    assert.equal((await googleAuthorization(callback, env!, 'operator@example.invalid')).status, 400);
  } finally { globalThis.fetch = original; }
});
