import type { CalendarEnvironment } from './calendar.ts';

export type GoogleAuthEnvironment = CalendarEnvironment & { GOOGLE_OAUTH_REDIRECT_URI?: string; GOOGLE_TOKEN_ENCRYPTION_KEY?: string };
function bytes(value: string): Uint8Array { return Uint8Array.from(atob(value), (character) => character.charCodeAt(0)); }
async function key(env: GoogleAuthEnvironment): Promise<CryptoKey> {
  if (!env.GOOGLE_TOKEN_ENCRYPTION_KEY) throw new Error('google_encryption_not_configured');
  const raw = bytes(env.GOOGLE_TOKEN_ENCRYPTION_KEY);
  if (raw.length !== 32) throw new Error('google_encryption_not_configured');
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
function base64(value: Uint8Array): string { return btoa(Array.from(value, (byte) => String.fromCharCode(byte)).join('')); }
export async function refreshToken(env: GoogleAuthEnvironment): Promise<string | undefined> {
  if (env.GOOGLE_REFRESH_TOKEN) return env.GOOGLE_REFRESH_TOKEN;
  const record = await env.INTAKE_DB?.prepare("SELECT value FROM integration_state WHERE name = 'google-refresh-token'").first<{ value: string }>();
  if (!record) return undefined;
  const value = JSON.parse(record.value) as { iv: string; ciphertext: string };
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(value.iv) }, await key(env), bytes(value.ciphertext)));
}

export async function googleAuthorization(request: Request, env: GoogleAuthEnvironment, email: string): Promise<Response> {
  if (!env.INTAKE_DB || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_OAUTH_REDIRECT_URI || !env.GOOGLE_TOKEN_ENCRYPTION_KEY) return Response.json({ error: 'google_connection_not_configured' }, { status: 503 });
  const redirect = new URL(env.GOOGLE_OAUTH_REDIRECT_URI);
  if (redirect.protocol !== 'https:' || redirect.origin !== new URL(request.url).origin || redirect.pathname !== '/operator/google/callback') return Response.json({ error: 'google_redirect_invalid' }, { status: 503 });
  const url = new URL(request.url);
  if (url.pathname === '/operator/google/connect') {
    await key(env);
    const state = crypto.randomUUID();
    const saved = await env.INTAKE_DB.prepare('INSERT INTO integration_state (name, value) VALUES (?1, ?2)').bind(`google-oauth-${state}`, JSON.stringify({ email, expires: Date.now() + 10 * 60_000 })).run();
    if (!saved.success) throw new Error('google_state_failed');
    const authorize = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    const parameters = { client_id: env.GOOGLE_CLIENT_ID, redirect_uri: redirect.href, response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.events.readonly', access_type: 'offline', prompt: 'consent', state };
    for (const [name, value] of Object.entries(parameters)) authorize.searchParams.set(name, value);
    return Response.redirect(authorize.href, 302);
  }
  const state = url.searchParams.get('state') ?? '';
  const code = url.searchParams.get('code');
  if (!/^[0-9a-f-]{36}$/.test(state) || !code || code.length > 4096) return Response.json({ error: 'google_authorization_invalid' }, { status: 400 });
  // DELETE RETURNING consumes the consent state exactly once.
  const stored = await env.INTAKE_DB.prepare('DELETE FROM integration_state WHERE name = ?1 RETURNING value').bind(`google-oauth-${state}`).first<{ value: string }>();
  if (!stored) return Response.json({ error: 'google_authorization_expired' }, { status: 400 });
  const consent = JSON.parse(stored.value) as { email: string; expires: number };
  if (consent.email !== email || consent.expires < Date.now()) return Response.json({ error: 'google_authorization_expired' }, { status: 400 });
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000),
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, code, redirect_uri: redirect.href, grant_type: 'authorization_code' }) });
  const credentials = await response.json() as { refresh_token?: string; scope?: string };
  if (!response.ok || !credentials.refresh_token || !credentials.scope?.split(' ').includes('https://www.googleapis.com/auth/calendar.events.readonly')) return Response.json({ error: 'google_authorization_failed' }, { status: 400 });
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(env), new TextEncoder().encode(credentials.refresh_token));
  const saved = await env.INTAKE_DB.prepare("INSERT INTO integration_state (name, value) VALUES ('google-refresh-token', ?1) ON CONFLICT(name) DO UPDATE SET value = excluded.value")
    .bind(JSON.stringify({ iv: base64(iv), ciphertext: base64(new Uint8Array(encrypted)) })).run();
  if (!saved.success) throw new Error('google_token_storage_failed');
  return Response.redirect(`${redirect.origin}/operator/`, 303);
}
