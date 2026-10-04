import { recordBooking, validBooking, type BookingInput } from './booking.ts';
import { refreshToken } from './google-auth.ts';

export type CalendarEnvironment = {
  INTAKE_DB?: D1Database; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string; GOOGLE_BOOKING_CALENDAR_ID?: string; BOOKING_SYNC_ENABLED?: string;
  GOOGLE_TOKEN_ENCRYPTION_KEY?: string;
};
type Event = { id?: string; status?: string; description?: string; start?: { dateTime?: string }; end?: { dateTime?: string } };
type Cursor = { syncToken?: string; pageToken?: string };
type Call = (operation: Record<string, unknown>) => Promise<Record<string, unknown>>;

export function calendarTime(value: string): { date: string; time: string } {
  if (!/T\d\d:\d\d(?::\d\d(?:\.\d+)?)?(?:Z|[+-]\d\d:\d\d)$/.test(value)) throw new Error('calendar_time_invalid');
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('calendar_time_invalid');
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export async function syncCalendar(env: CalendarEnvironment, call: Call): Promise<void> {
  if (env.BOOKING_SYNC_ENABLED !== 'true') return;
  const db = env.INTAKE_DB;
  if (!db || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_BOOKING_CALENDAR_ID) {
    console.error(JSON.stringify({ event: 'booking_sync_not_configured' })); return;
  }
  const token = crypto.randomUUID();
  const now = new Date().toISOString();
  const claimed = await db.prepare(`INSERT INTO integration_state (name, lease_until, lease_token) VALUES ('google-calendar', ?1, ?2)
    ON CONFLICT(name) DO UPDATE SET lease_until = excluded.lease_until, lease_token = excluded.lease_token
    WHERE integration_state.lease_until IS NULL OR integration_state.lease_until <= ?3`)
    .bind(new Date(Date.now() + 4 * 60_000).toISOString(), token, now).run();
  if (!claimed.success || claimed.meta?.changes !== 1) return;
  try {
    const refresh = await refreshToken(env);
    if (!refresh) throw new Error('calendar_auth_not_configured');
    const state = await db.prepare("SELECT value FROM integration_state WHERE name = 'google-calendar'").first<{ value: string }>();
    let cursor: Cursor = JSON.parse(state?.value ?? '{}');
    const auth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: refresh, grant_type: 'refresh_token' }) });
    if (!auth.ok) throw new Error('calendar_auth_failed');
    const credentials = await auth.json() as { access_token?: string };
    if (!credentials.access_token) throw new Error('calendar_auth_failed');
    // Persist each page before moving the cursor, so pending JobTread delivery cannot lose an event.
    for (let page = 0; page < 5; page++) {
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.GOOGLE_BOOKING_CALENDAR_ID)}/events`);
      url.searchParams.set('maxResults', '100'); url.searchParams.set('showDeleted', 'true'); url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('timeZone', 'America/Denver');
      if (cursor.syncToken) url.searchParams.set('syncToken', cursor.syncToken);
      if (cursor.pageToken) url.searchParams.set('pageToken', cursor.pageToken);
      const response = await fetch(url, { headers: { Authorization: `Bearer ${credentials.access_token}` }, redirect: 'manual', signal: AbortSignal.timeout(10_000) });
      if (response.status === 410) {
        cursor = {};
        const reset = await db.prepare("UPDATE integration_state SET value = '{}' WHERE name = 'google-calendar' AND lease_token = ?1").bind(token).run();
        if (!reset.success || reset.meta?.changes !== 1) throw new Error('calendar_lease_lost');
        continue;
      }
      if (!response.ok) throw new Error('calendar_read_failed');
      const result = await response.json() as { items?: Event[]; nextPageToken?: string; nextSyncToken?: string };
      for (const event of result.items ?? []) {
        if (!event.id || !/^[a-zA-Z0-9_-]{1,200}$/.test(event.id)) continue;
        const known = await db.prepare('SELECT receipt_id, payload FROM calendar_booking_events WHERE event_id = ?1').bind(event.id).first<{ receipt_id: string; payload: string }>();
        const matches = [...new Set(event.description?.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi)?.map((value) => value.toLowerCase()) ?? [])];
        const receiptId = known?.receipt_id ?? (matches.length === 1 ? matches[0] : undefined);
        if (!receiptId) continue;
        const inquiry = await db.prepare('SELECT receipt_id FROM intake_submissions WHERE receipt_id = ?1').bind(receiptId).first();
        if (!inquiry) continue;
        let input: BookingInput;
        if (event.status === 'cancelled') {
          if (!known) continue;
          input = { ...JSON.parse(known.payload), cancelled: true };
        } else {
          if (!event.start?.dateTime || !event.end?.dateTime) continue;
          const start = calendarTime(event.start.dateTime); const end = calendarTime(event.end.dateTime);
          if (start.date !== end.date) throw new Error('calendar_overnight_unsupported');
          input = { eventId: event.id, date: start.date, start: start.time, end: end.time, cancelled: false };
        }
        if (!validBooking(input)) throw new Error('calendar_event_invalid');
        const payload = JSON.stringify(input);
        const saved = await db.prepare(`INSERT INTO calendar_booking_events (event_id, receipt_id, payload, updated_at) VALUES (?1, ?2, ?3, ?4)
          ON CONFLICT(event_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at, delivered_at = NULL, error_category = NULL
          WHERE calendar_booking_events.payload != excluded.payload`).bind(event.id, receiptId, payload, now).run();
        if (!saved.success) throw new Error('calendar_checkpoint_failed');
      }
      cursor = result.nextPageToken ? { ...cursor, pageToken: result.nextPageToken } : { syncToken: result.nextSyncToken };
      if (!result.nextPageToken && !result.nextSyncToken) throw new Error('calendar_cursor_missing');
      const saved = await db.prepare("UPDATE integration_state SET value = ?1 WHERE name = 'google-calendar' AND lease_token = ?2").bind(JSON.stringify(cursor), token).run();
      if (!saved.success || saved.meta?.changes !== 1) throw new Error('calendar_lease_lost');
      if (!result.nextPageToken) break;
    }
    const pending = await db.prepare("SELECT event_id, receipt_id, payload FROM calendar_booking_events WHERE delivered_at IS NULL ORDER BY COALESCE(last_attempt_at, ''), updated_at LIMIT 25").all<{ event_id: string; receipt_id: string; payload: string }>();
    for (const event of pending.results) {
      const heartbeat = await db.prepare("UPDATE integration_state SET lease_until = ?1 WHERE name = 'google-calendar' AND lease_token = ?2 AND lease_until > ?3").bind(new Date(Date.now() + 4 * 60_000).toISOString(), token, new Date().toISOString()).run();
      if (!heartbeat.success || heartbeat.meta?.changes !== 1) throw new Error('calendar_lease_lost');
      await db.prepare('UPDATE calendar_booking_events SET last_attempt_at = ?1 WHERE event_id = ?2').bind(new Date().toISOString(), event.event_id).run();
      let category = 'booking_delivery_failed';
      try {
        const result = await recordBooking(event.receipt_id, JSON.parse(event.payload), db, call);
        if (result.status === 200) {
          await db.prepare('UPDATE calendar_booking_events SET delivered_at = ?1, error_category = NULL WHERE event_id = ?2 AND payload = ?3').bind(now, event.event_id, event.payload).run();
          continue;
        }
        category = String(result.body.error);
      } catch { /* Preserve durable pending state; a writing checkpoint requires reconciliation. */ }
      await db.prepare('UPDATE calendar_booking_events SET error_category = ?1 WHERE event_id = ?2').bind(category, event.event_id).run();
      console.error(JSON.stringify({ event: 'booking_delivery_pending', category }));
    }
  } catch {
    console.error(JSON.stringify({ event: 'booking_sync_failed' }));
  } finally {
    await db.prepare("UPDATE integration_state SET lease_until = NULL, lease_token = NULL WHERE name = 'google-calendar' AND lease_token = ?1").bind(token).run();
  }
}
