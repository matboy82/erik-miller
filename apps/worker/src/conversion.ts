// SMS intentionally has no transport, credentials, or activation path here.
export type ConversionConfig = {
  budgetBands: { projectType: string; min: number; max: number; scope: string }[];
  guide: { enabled: boolean; title: string; text: string };
  sender: string; replyTo: string; postalAddress: string;
  reviews: { enabled: boolean; delayDays: number; links: { label: string; url: string }[]; subject: string; ask: string; thanks: string };
  nurture: { enabled: boolean; touches: { day: number; subject: string; text: string }[] };
};
export interface ConversionEnvironment {
  INTAKE_DB?: D1Database;
  CONVERSION_ENABLED?: string;
  CONVERSION_OWNER_EMAIL?: string;
  CONVERSION_OPERATOR_EMAIL?: string;
  CONVERSION_PUBLIC_URL?: string;
  BOOKING_SYNC_ENABLED?: string;
  JOBTREAD_ORGANIZATION_ID?: string;
  JOBTREAD_EMAIL_CUSTOM_FIELD_ID?: string;
  CONVERSION_WEBHOOK_SECRET?: string;
  EMAIL?: { send(message: { to: string; from: string; replyTo: string; subject: string; text: string }): Promise<{ messageId: string }> };
}
export type JobTread = (operation: Record<string, unknown>) => Promise<Record<string, unknown>>;
const DAY = 86400_000;
const owner = 'millerremodelingidaho@gmail.com';
export const defaultConversionConfig: ConversionConfig = {
  budgetBands: [], guide: { enabled: false, title: 'Planning your Treasure Valley remodel', text: '' },
  sender: '', replyTo: owner, postalAddress: '',
  reviews: { enabled: false, delayDays: 3, links: [], subject: 'Your Miller Remodeling project', ask: '', thanks: '' },
  nurture: { enabled: false, touches: [] },
};
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const projectTypes = ['Kitchen', 'Bathroom', 'Whole home', 'Addition', 'ADU or mother-in-law space', 'Home repair', 'Another project'];
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' } });
const exact = (value: unknown, keys: string[]) => Boolean(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(k => keys.includes(k)) && keys.every(k => Object.hasOwn(value, k)));
const text = (value: unknown, max = 3000) => typeof value === 'string' && value.length <= max && !value.includes('\u0000');
export function validConversionConfig(value: unknown): value is ConversionConfig {
  if (!exact(value, ['budgetBands','guide','sender','replyTo','postalAddress','reviews','nurture'])) return false;
  const c = value as ConversionConfig;
  if (!Array.isArray(c.budgetBands) || c.budgetBands.length > 7 || new Set(c.budgetBands.map(b => b?.projectType)).size !== c.budgetBands.length
    || !c.budgetBands.every(b => exact(b, ['projectType','min','max','scope']) && projectTypes.includes(b.projectType) && Number.isSafeInteger(b.min) && Number.isSafeInteger(b.max) && b.min > 0 && b.max >= b.min && b.max <= 10_000_000 && text(b.scope, 500) && b.scope.trim())) return false;
  if (!exact(c.guide, ['enabled','title','text']) || typeof c.guide.enabled !== 'boolean' || !text(c.guide.title, 160) || !text(c.guide.text, 40000) || (c.guide.enabled && (!c.guide.title.trim() || !c.guide.text.trim()))) return false;
  if (!text(c.sender, 254) || (c.sender && !emailPattern.test(c.sender)) || !text(c.replyTo, 254) || !emailPattern.test(c.replyTo) || !text(c.postalAddress, 500)) return false;
  if (!exact(c.reviews, ['enabled','delayDays','links','subject','ask','thanks']) || typeof c.reviews.enabled !== 'boolean' || !Number.isInteger(c.reviews.delayDays) || c.reviews.delayDays < 0 || c.reviews.delayDays > 30 || !Array.isArray(c.reviews.links) || c.reviews.links.length > 3) return false;
  if (!c.reviews.links.every(l => { try { const u = new URL(l.url); return exact(l, ['label','url']) && text(l.label, 50) && l.label.trim() && u.protocol === 'https:' && !u.username && !u.password && ['search.google.com','g.page','www.google.com','www.facebook.com','facebook.com','www.houzz.com','houzz.com'].includes(u.hostname) && l.url.length <= 1000; } catch { return false; } })) return false;
  if (![c.reviews.subject,c.reviews.ask,c.reviews.thanks].every(t => text(t)) || /[\r\n]/.test(c.reviews.subject) || (c.reviews.enabled && (!c.reviews.links.length || !c.reviews.subject.trim() || !c.reviews.ask.trim() || !c.reviews.thanks.trim()))) return false;
  if (!exact(c.nurture, ['enabled','touches']) || typeof c.nurture.enabled !== 'boolean' || !Array.isArray(c.nurture.touches) || c.nurture.touches.length > 3 || (c.nurture.enabled && !c.nurture.touches.length)) return false;
  if (!c.nurture.touches.every((t,i,a) => exact(t,['day','subject','text']) && Number.isInteger(t.day) && t.day >= 1 && t.day <= 14 && (!i || t.day > a[i-1].day) && text(t.subject,160) && t.subject.trim() && !/[\r\n]/.test(t.subject) && text(t.text) && t.text.trim())) return false;
  return !(c.reviews.enabled || c.nurture.enabled) || Boolean(c.sender && c.postalAddress.trim());
}
type ConfigRow = { revision: string; draft: string; approved: string | null; approved_by: string | null; approved_at: string | null };
async function configRow(db: D1Database): Promise<ConfigRow | null> { return db.prepare('SELECT * FROM conversion_config WHERE id = 1').first<ConfigRow>(); }
export async function approvedConversion(env: ConversionEnvironment): Promise<ConversionConfig | null> {
  if (env.CONVERSION_ENABLED !== 'true' || !env.INTAKE_DB) return null;
  const row = await configRow(env.INTAKE_DB);
  if (!row?.approved || row.approved_by !== (env.CONVERSION_OWNER_EMAIL ?? owner)) return null;
  const c: unknown = JSON.parse(row.approved);
  return validConversionConfig(c) ? c : null;
}
export function publicConversion(c: ConversionConfig | null) { return { budgetBands: c?.budgetBands ?? [], guide: c?.guide.enabled ? { title: c.guide.title } : null }; }
export function nurtureSchedule(c: ConversionConfig, start: number) { return c.nurture.touches.map(t => ({ ...t, dueAt: new Date(start + t.day * DAY).toISOString(), expiresAt: new Date(start + (t.day + 1) * DAY).toISOString() })); }

export async function captureConversion(env: ConversionEnvironment, receipt: string, payload: { email?: string; followupConsent?: boolean; leadType?: string }, guide?: string): Promise<void> {
  if (!env.INTAKE_DB) throw new Error('conversion_unavailable');
  const result = await env.INTAKE_DB.prepare(`INSERT OR IGNORE INTO conversion_leads (receipt_id,email,nurture_consent,unsubscribe_token,download_token,guide_snapshot)
    VALUES (?1,?2,?3,?4,?5,?6)`).bind(receipt, payload.email ?? null, payload.followupConsent === true ? 1 : 0, crypto.randomUUID() + crypto.randomUUID(), payload.leadType === 'lead_magnet' ? crypto.randomUUID() + crypto.randomUUID() : null, guide ?? null).run();
  if (!result.success) throw new Error('conversion_capture_failed');
}
type Lead = { receipt_id: string; email: string | null; nurture_consent: number; unsubscribe_token: string; enrolled_at: string | null; stopped_at: string | null; stop_reason: string | null; completed_at: string | null; review_reported_at: string | null; review_source: string | null };
type Inquiry = { state: string; external_job_id: string | null; delivered_at: string | null; created_at: string };
async function enqueue(db: D1Database, receipt: string, kind: string, recipient: string, subject: string, body: string, due: string, expires: string) {
  const saved = await db.prepare(`INSERT OR IGNORE INTO conversion_messages (id,receipt_id,kind,recipient,subject,body,due_at,expires_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`).bind(crypto.randomUUID(),receipt,kind,recipient,subject,body,due,expires).run();
  if (!saved.success) throw new Error('conversion_checkpoint_failed');
}
export async function stopNurture(db: D1Database, receipt: string, reason: string): Promise<void> {
  const result = await db.batch([
    db.prepare("UPDATE conversion_leads SET stopped_at = COALESCE(stopped_at, ?1), stop_reason = CASE WHEN ?2 = 'unsubscribed' THEN ?2 ELSE COALESCE(stop_reason, ?2) END WHERE receipt_id = ?3").bind(new Date().toISOString(),reason,receipt),
    db.prepare("UPDATE conversion_messages SET state = 'cancelled' WHERE receipt_id = ?1 AND kind LIKE 'nurture_%' AND state IN ('pending','failed')").bind(receipt),
  ]);
  if (result.some(r => !r.success)) throw new Error('conversion_stop_failed');
}
async function hasBooking(db: D1Database, receipt: string) {
  // Any recorded consultation ends nurture permanently, even after a cancellation.
  const booked = await db.prepare('SELECT event_id FROM intake_bookings WHERE receipt_id = ?1 LIMIT 1').bind(receipt).first();
  const pending = await db.prepare('SELECT event_id FROM calendar_booking_events WHERE receipt_id = ?1 LIMIT 1').bind(receipt).first();
  return Boolean(booked || pending);
}
export async function captureCompletedJob(env: ConversionEnvironment, call: JobTread, jobId: string, contactId: string): Promise<{receiptId:string}> {
  const c=await approvedConversion(env);
  if(!c?.reviews.enabled || !env.INTAKE_DB || !env.JOBTREAD_ORGANIZATION_ID || !env.JOBTREAD_EMAIL_CUSTOM_FIELD_ID)throw new Error('reviews_not_configured');
  if(!/^[a-zA-Z0-9_-]{1,128}$/.test(jobId)||!/^[a-zA-Z0-9_-]{1,128}$/.test(contactId))throw new Error('validation_failed');
  const db=env.INTAKE_DB;
  const old=await db.prepare('SELECT receipt_id FROM conversion_review_jobs WHERE job_id=?1').bind(jobId).first<{receipt_id:string}>();
  if(old && await db.prepare('SELECT receipt_id FROM conversion_leads WHERE receipt_id=?1').bind(old.receipt_id).first())return {receiptId:old.receipt_id};
  const result=await call({
    job:{$:{id:jobId},id:{},closedOn:{},organization:{id:{}},location:{account:{id:{}}}},
    contact:{$:{id:contactId},id:{},account:{id:{}},customFieldValues:{$:{size:100},nextPage:{},nodes:{customField:{id:{}},value:{}}}},
  });
  const job=result.job as {id?:string;closedOn?:string;organization?:{id?:string};location?:{account?:{id?:string}}};
  const contact=result.contact as {id?:string;account?:{id?:string};customFieldValues?:{nextPage?:string;nodes?:{customField?:{id?:string};value?:unknown}[]}};
  if(job?.id!==jobId || job.organization?.id!==env.JOBTREAD_ORGANIZATION_ID || !job.closedOn || !/^\d{4}-\d{2}-\d{2}$/.test(job.closedOn) || contact?.id!==contactId || contact.account?.id!==job.location?.account?.id || contact.customFieldValues?.nextPage)throw new Error('completion_readback_failed');
  const address=contact.customFieldValues?.nodes?.find(v=>v.customField?.id===env.JOBTREAD_EMAIL_CUSTOM_FIELD_ID)?.value;
  if(typeof address!=='string'||!emailPattern.test(address))throw new Error('customer_email_required');
  const completed=Date.parse(`${job.closedOn}T23:59:59Z`);
  if(!Number.isFinite(completed) || completed>Date.now()+DAY || Date.now()>completed+(c.reviews.delayDays+7)*DAY)throw new Error('completion_outside_request_window');
  const existing=await db.prepare('SELECT receipt_id FROM intake_submissions WHERE external_job_id=?1 AND state=?2 AND created_at>?3 LIMIT 1').bind(jobId,'delivered',new Date(Date.now()-30*DAY).toISOString()).first<{receipt_id:string}>();
  const receiptId=old?.receipt_id??existing?.receipt_id??crypto.randomUUID();const now=new Date().toISOString();
  const operations=[];
  if(!existing && !old)operations.push(db.prepare(`INSERT INTO intake_submissions(receipt_id,idempotency_key,state,created_at,updated_at,delivered_at,payload_expires_at,metadata_expires_at,payload,external_job_id,external_contact_id,delivery_step) VALUES(?1,?1,'delivered',?2,?2,?2,?3,?4,NULL,?5,?6,'verified')`).bind(receiptId,now,new Date(Date.now()+30*DAY).toISOString(),new Date(Date.now()+90*DAY).toISOString(),jobId,contactId));
  if(!old)operations.push(db.prepare('INSERT INTO conversion_review_jobs(job_id,receipt_id,created_at) VALUES(?1,?2,?3)').bind(jobId,receiptId,now));
  if(operations.length){const saved=await db.batch(operations);if(saved.some(r=>!r.success))throw new Error('conversion_checkpoint_failed');}
  await captureConversion(env,receiptId,{email:address});
  await db.prepare('UPDATE conversion_leads SET email=?1 WHERE receipt_id=?2').bind(address.toLowerCase(),receiptId).run();
  return {receiptId};
}

export async function cleanupConversion(db:D1Database):Promise<void>{
  const before=new Date(Date.now()-30*DAY).toISOString();
  await db.batch([
    db.prepare("UPDATE conversion_messages SET recipient='',body='',subject='',state=CASE WHEN state IN ('pending','failed') THEN 'cancelled' ELSE state END WHERE receipt_id IN (SELECT receipt_id FROM intake_submissions WHERE created_at<=?1)").bind(before),
    db.prepare('UPDATE conversion_leads SET email=NULL,guide_snapshot=NULL,download_token=NULL WHERE receipt_id IN (SELECT receipt_id FROM intake_submissions WHERE created_at<=?1)').bind(before),
    db.prepare('DELETE FROM conversion_review_jobs WHERE created_at<=?1').bind(new Date(Date.now()-365*DAY).toISOString()),
  ]);
}
const baseUrl = (env: ConversionEnvironment) => env.CONVERSION_PUBLIC_URL ?? 'https://erik-miller-worker.matt-boyer.workers.dev';
function footer(c: ConversionConfig, env: ConversionEnvironment, token: string) { return `\n\nMiller Remodeling LLC\n${c.postalAddress}\nStop these follow-ups: ${baseUrl(env)}/conversion/unsubscribe?token=${encodeURIComponent(token)}`; }
export async function runConversion(env: ConversionEnvironment, call: JobTread, now = Date.now()): Promise<void> {
  const c = await approvedConversion(env);
  if (!c || !env.INTAKE_DB) return;
  const db = env.INTAKE_DB;
  const leads = await db.prepare(`SELECT c.* FROM conversion_leads c JOIN intake_submissions i ON i.receipt_id = c.receipt_id WHERE i.state = 'delivered' AND c.email IS NOT NULL ORDER BY i.created_at DESC LIMIT 100`).all<Lead>();
  for (const lead of leads.results) {
    const inquiry = await db.prepare('SELECT state, external_job_id, delivered_at, created_at FROM intake_submissions WHERE receipt_id = ?1').bind(lead.receipt_id).first<Inquiry>();
    if (!inquiry?.external_job_id || !inquiry.delivered_at) continue;
    if (!lead.stopped_at && await hasBooking(db, lead.receipt_id)) { await stopNurture(db,lead.receipt_id,'consultation_booked'); lead.stopped_at = new Date(now).toISOString(); }
    if (c.nurture.enabled && env.BOOKING_SYNC_ENABLED === 'true' && lead.nurture_consent && !lead.enrolled_at && !lead.stopped_at && now - Date.parse(inquiry.created_at) <= DAY) {
      const scheduled = nurtureSchedule(c, Date.parse(inquiry.created_at));
      for (const touch of scheduled) await enqueue(db,lead.receipt_id,`nurture_${touch.day}`,lead.email!,touch.subject,touch.text + footer(c,env,lead.unsubscribe_token),touch.dueAt,touch.expiresAt);
      await db.prepare('UPDATE conversion_leads SET enrolled_at = ?1 WHERE receipt_id = ?2 AND enrolled_at IS NULL').bind(new Date(now).toISOString(),lead.receipt_id).run();
    }
    if (c.reviews.enabled && !lead.completed_at) {
      const result = await call({ job: { $: { id: inquiry.external_job_id }, id: {}, closedOn: {}, organization: { id: {} } } });
      const job = result.job as { id?: string; closedOn?: string };
      if (job?.id === inquiry.external_job_id && job.closedOn && /^\d{4}-\d{2}-\d{2}$/.test(job.closedOn)) {
        const completed = new Date(`${job.closedOn}T23:59:59Z`).toISOString();
        const due = new Date(Date.parse(completed) + c.reviews.delayDays * DAY).toISOString();
        // Completion polling must not send a backlog of old requests.
        if (now <= Date.parse(due) + 7 * DAY) await enqueue(db,lead.receipt_id,'review_ask',lead.email!,c.reviews.subject,`${c.reviews.ask}\n\n${c.reviews.links.map(l => `${l.label}: ${l.url}`).join('\n')}\n\nAlready posted? Tell Erik: ${baseUrl(env)}/conversion/review?token=${encodeURIComponent(lead.unsubscribe_token)}` + footer(c,env,lead.unsubscribe_token),due,new Date(Date.parse(due)+7*DAY).toISOString());
        await db.prepare('UPDATE conversion_leads SET completed_at = ?1 WHERE receipt_id = ?2').bind(completed,lead.receipt_id).run();
        await stopNurture(db,lead.receipt_id,'job_completed');
      }
    }
  }
  if (!env.EMAIL) return; // Configuration can be prepared without an active sending account.
  await db.prepare("UPDATE conversion_messages SET state = 'unknown', error_category = 'send_result_unknown' WHERE state = 'sending' AND claimed_at <= ?1").bind(new Date(now-10*60_000).toISOString()).run();
  const messages = await db.prepare("SELECT * FROM conversion_messages WHERE state IN ('pending','failed') AND due_at <= ?1 AND attempts < 5 ORDER BY due_at LIMIT 20").bind(new Date(now).toISOString()).all<Message>();
  for (const m of messages.results) {
    const lead = await db.prepare('SELECT * FROM conversion_leads WHERE receipt_id = ?1').bind(m.receipt_id).first<Lead>();
    const inquiry = await db.prepare('SELECT state, external_job_id FROM intake_submissions WHERE receipt_id = ?1').bind(m.receipt_id).first<Inquiry>();
    const optedOut = Boolean(lead?.stopped_at && lead.stop_reason === 'unsubscribed');
    const nurtureBlocked = m.kind.startsWith('nurture_') && (!c.nurture.enabled || env.BOOKING_SYNC_ENABLED !== 'true' || !lead?.nurture_consent || lead.stopped_at || await hasBooking(db,m.receipt_id));
    if (!lead || inquiry?.state !== 'delivered' || !inquiry.external_job_id || now > Date.parse(m.expires_at) || optedOut || nurtureBlocked || (m.kind.startsWith('review_') && !c.reviews.enabled)) {
      await db.prepare("UPDATE conversion_messages SET state = 'cancelled' WHERE id = ?1 AND state IN ('pending','failed')").bind(m.id).run(); continue;
    }
    const claim = await db.prepare(`UPDATE conversion_messages SET state = 'sending', attempts = attempts + 1, claimed_at = ?2 WHERE id = ?1 AND state IN ('pending','failed')
      AND EXISTS(SELECT 1 FROM conversion_config WHERE id=1 AND approved=?3)
      AND EXISTS(SELECT 1 FROM conversion_leads WHERE receipt_id=conversion_messages.receipt_id AND (stop_reason IS NULL OR stop_reason!='unsubscribed'))`).bind(m.id,new Date(now).toISOString(),JSON.stringify(c)).run();
    if (claim.meta?.changes !== 1) continue;
    try {
      const result = await env.EMAIL.send({ to:m.recipient, from:c.sender, replyTo:c.replyTo, subject:m.subject, text:m.body });
      if (!result.messageId) throw new Error('send_result_unknown');
      const saved = await db.prepare("UPDATE conversion_messages SET state = 'sent', provider_id = ?1, sent_at = ?2 WHERE id = ?3 AND state = 'sending'").bind(result.messageId,new Date(now).toISOString(),m.id).run();
      if (!saved.success || saved.meta?.changes !== 1) throw new Error('send_result_unknown');
    } catch (error) {
      const code = (error as {code?: string})?.code;
      const retryable = ['E_RATE_LIMIT_EXCEEDED','E_DAILY_LIMIT_EXCEEDED','E_SENDER_NOT_VERIFIED','E_SENDER_DOMAIN_NOT_AVAILABLE'].includes(code ?? '');
      await db.prepare('UPDATE conversion_messages SET state = ?1, error_category = ?2, due_at = ?3 WHERE id = ?4 AND state = ?5').bind(retryable?'failed':'unknown',retryable?'sender_unavailable':'send_result_unknown',new Date(now+3600_000).toISOString(),m.id,'sending').run();
      console.warn(JSON.stringify({event:'conversion_delivery_needs_attention',category:retryable?'sender_unavailable':'send_result_unknown'}));
    }
  }
  // Comments are internal only. Ambiguous comment writes require reconciliation, never blind replay.
  const sent = await db.prepare("SELECT m.*, i.external_job_id FROM conversion_messages m JOIN intake_submissions i ON i.receipt_id = m.receipt_id WHERE m.state = 'sent' AND m.timeline_state = 'pending' LIMIT 20").all<Message & {external_job_id:string}>();
  for (const m of sent.results) {
    const claim = await db.prepare("UPDATE conversion_messages SET timeline_state = 'writing' WHERE id = ?1 AND timeline_state = 'pending'").bind(m.id).run();
    if (claim.meta?.changes !== 1) continue;
    try {
      const timelineText=`${m.kind} email sent at ${m.sent_at}.\n${m.subject}\n\n${m.body}`;
      const result = await call({ createComment:{ $:{ targetType:'job',targetId:m.external_job_id,name:'Website lead follow-up',message:timelineText.length>4096?timelineText.slice(0,4030)+'\n[Full message retained in the delivery record.]':timelineText,isVisibleToAll:false,isVisibleToCustomerRoles:false,isVisibleToVendorRoles:false,isVisibleToInternalRoles:true }, createdComment:{id:{},job:{id:{}}} } });
      const comment = (result.createComment as {createdComment?: {id?:string;job?:{id?:string}}})?.createdComment;
      if (!comment?.id || comment.job?.id !== m.external_job_id) throw new Error('timeline_result_unknown');
      await db.prepare("UPDATE conversion_messages SET timeline_state = 'logged' WHERE id = ?1").bind(m.id).run();
    } catch { await db.prepare("UPDATE conversion_messages SET timeline_state = 'unknown' WHERE id = ?1").bind(m.id).run(); }
  }
}
type Message = { id:string; receipt_id:string; kind:string; due_at:string; expires_at:string; recipient:string; subject:string; body:string; sent_at:string|null };

export async function conversionOperator(request: Request, env: ConversionEnvironment, email: string, call?: JobTread): Promise<Response> {
  if (!env.INTAKE_DB) return reply({error:'conversion_unavailable'},503);
  const db = env.INTAKE_DB; const path = new URL(request.url).pathname;
  if (request.method !== 'GET' && request.headers.get('Origin') && request.headers.get('Origin') !== new URL(request.url).origin) return reply({error:'origin_not_allowed'},403);
  if (path === '/operator/conversion/config' && request.method === 'GET') { const row=await configRow(db); return reply({revision:row?.revision??null,draft:row?JSON.parse(row.draft):defaultConversionConfig,approvedBy:row?.approved_by??null,approvedAt:row?.approved_at??null,enabled:env.CONVERSION_ENABLED==='true',emailBound:Boolean(env.EMAIL),sms:'deferred'}); }
  if (path === '/operator/conversion/config' && request.method === 'PUT') {
    const raw=await request.text(); if(raw.length>60000) return reply({error:'validation_failed'},400);
    let value:unknown; try{value=JSON.parse(raw);}catch{return reply({error:'validation_failed'},400);}
    if(!validConversionConfig(value))return reply({error:'validation_failed'},400);
    const revision=crypto.randomUUID();
    await db.batch([
      db.prepare('INSERT INTO conversion_config(id,revision,draft) VALUES(1,?1,?2) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,draft=excluded.draft,approved=NULL,approved_by=NULL,approved_at=NULL').bind(revision,JSON.stringify(value)),
      db.prepare("UPDATE conversion_messages SET state='cancelled' WHERE state IN ('pending','failed')"),
    ]);
    return reply({revision,approval:'required'});
  }
  if(path==='/operator/conversion/approve' && request.method==='POST') {
    if(email !== (env.CONVERSION_OWNER_EMAIL??owner))return reply({error:'erik_approval_required'},403);
    const raw=await request.text(); if(raw.length>200)return reply({error:'validation_failed'},400);
    let revision:unknown;try{revision=JSON.parse(raw).revision;}catch{return reply({error:'validation_failed'},400);}
    if(typeof revision!=='string')return reply({error:'validation_failed'},400);
    const result=await db.prepare('UPDATE conversion_config SET approved=draft, approved_by=?1,approved_at=?2 WHERE id=1 AND revision=?3').bind(email,new Date().toISOString(),revision).run();
    return result.meta?.changes===1?reply({approval:'saved'}):reply({error:'revision_changed'},409);
  }
  if(path==='/operator/conversion/status' && request.method==='GET') {
    const messages=await db.prepare('SELECT id,receipt_id,kind,due_at,state,attempts,error_category,timeline_state,sent_at FROM conversion_messages ORDER BY due_at DESC LIMIT 100').all();
    return reply({enabled:env.CONVERSION_ENABLED==='true',emailBound:Boolean(env.EMAIL),bookingSyncEnabled:env.BOOKING_SYNC_ENABLED==='true',sms:'deferred',messages:messages.results});
  }
  if(path==='/operator/conversion/stop' && request.method==='POST') {
    const raw=await request.text();if(raw.length>200)return reply({error:'validation_failed'},400);
    let receipt:unknown;try{receipt=JSON.parse(raw).receiptId;}catch{return reply({error:'validation_failed'},400);}
    if(typeof receipt!=='string'||!/^[a-f0-9-]{36}$/i.test(receipt))return reply({error:'validation_failed'},400);
    await stopNurture(db,receipt,'operator_stopped');return reply({stopped:true});
  }
  if(path==='/operator/conversion/completed-job' && request.method==='POST' && call){
    const raw=await request.text();if(raw.length>500)return reply({error:'validation_failed'},400);
    let input:{jobId?:unknown;contactId?:unknown};try{input=JSON.parse(raw);}catch{return reply({error:'validation_failed'},400);}
    if(typeof input?.jobId!=='string'||typeof input.contactId!=='string')return reply({error:'validation_failed'},400);
    try{return reply(await captureCompletedJob(env,call,input.jobId,input.contactId));}catch(e){const code=e instanceof Error?e.message:'';return reply({error:['reviews_not_configured','validation_failed','completion_readback_failed','customer_email_required','completion_outside_request_window'].includes(code)?code:'completion_unavailable'},409);}
  }
  if(path==='/operator/conversion/reconcile' && request.method==='POST'){
    const raw=await request.text();if(raw.length>500)return reply({error:'validation_failed'},400);
    let input:{id?:unknown;outcome?:unknown;providerId?:unknown;timelineOutcome?:unknown};try{input=JSON.parse(raw);}catch{return reply({error:'validation_failed'},400);}
    if(typeof input?.id!=='string'||!/^[a-f0-9-]{36}$/i.test(input.id)||!['sent','absent'].includes(String(input.outcome)))return reply({error:'validation_failed'},400);
    if(input.outcome==='sent' && (typeof input.providerId!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(input.providerId)))return reply({error:'provider_id_required'},400);
    const result=await db.prepare("UPDATE conversion_messages SET state=?1,provider_id=?2,sent_at=?3,error_category=NULL WHERE id=?4 AND state='unknown'").bind(input.outcome==='sent'?'sent':'pending',input.providerId??null,input.outcome==='sent'?new Date().toISOString():null,input.id).run();
    return result.meta?.changes===1?reply({reconciled:true}):reply({error:'reconciliation_not_required'},409);
  }
  return reply({error:'not_found'},404);
}

export async function conversionPublic(request: Request, env: ConversionEnvironment): Promise<Response> {
  const url=new URL(request.url);
  if(url.pathname==='/conversion/public' && request.method==='GET')return reply(publicConversion(await approvedConversion(env)));
  if(!env.INTAKE_DB)return reply({error:'not_found'},404);
  const token=url.searchParams.get('token')??'';
  if(!/^[a-f0-9-]{72}$/i.test(token))return reply({error:'not_found'},404);
  const db=env.INTAKE_DB;
  if(url.pathname==='/conversion/download' && request.method==='GET') {
    const row=await db.prepare('SELECT c.guide_snapshot, i.state, i.created_at FROM conversion_leads c JOIN intake_submissions i ON i.receipt_id=c.receipt_id WHERE c.download_token=?1').bind(token).first<{guide_snapshot:string|null;state:string;created_at:string}>();
    if(!row?.guide_snapshot||Date.now()-Date.parse(row.created_at)>7*DAY)return reply({error:'not_found'},404);
    if(row.state!=='delivered')return reply({error:'delivery_pending'},425);
    return new Response(row.guide_snapshot,{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="miller-remodeling-cost-guide.txt"','Cache-Control':'no-store','X-Robots-Tag':'noindex','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
  }
  const lead=await db.prepare('SELECT * FROM conversion_leads WHERE unsubscribe_token=?1').bind(token).first<Lead>();
  if(!lead)return reply({error:'not_found'},404);
  if(!['/conversion/unsubscribe','/conversion/review'].includes(url.pathname))return reply({error:'not_found'},404);
  if(request.method==='GET') {
    const unsubscribe=url.pathname.endsWith('unsubscribe');
    return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Miller Remodeling</title><body><h1>${unsubscribe?'Stop follow-up emails':'Tell Erik you posted a review'}</h1><p>${unsubscribe?'This stops optional follow-ups for this inquiry.':'This sends Erik a notification. It does not publish a testimonial or verify the review.'}</p><form method="post"><button>${unsubscribe?'Stop follow-ups':'I posted a review'}</button></form></body></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; form-action 'self'; frame-ancestors 'none'"}});
  }
  if(request.method!=='POST')return reply({error:'method_not_allowed'},405);
  if(url.pathname.endsWith('unsubscribe')) { await stopNurture(db,lead.receipt_id,'unsubscribed'); return reply({stopped:true,message:'Your follow-up emails have been stopped.'}); }
  const c=await approvedConversion(env);
  if(!c?.reviews.enabled || !lead.completed_at || lead.review_reported_at || !lead.email || lead.stopped_at && lead.stop_reason==='unsubscribed')return reply({reported:Boolean(lead.review_reported_at)},lead.review_reported_at?200:409);
  const now=new Date().toISOString();
  await enqueue(db,lead.receipt_id,'review_thanks',lead.email,'Thank you for sharing your feedback',c.reviews.thanks+footer(c,env,lead.unsubscribe_token),now,new Date(Date.now()+7*DAY).toISOString());
  await enqueue(db,lead.receipt_id,'operator_review',env.CONVERSION_OPERATOR_EMAIL??owner,'A homeowner reported a new review',`Inquiry ${lead.receipt_id}: a homeowner reported posting a review. Verify it on the approved platforms before publishing.`,now,new Date(Date.now()+7*DAY).toISOString());
  await db.prepare('UPDATE conversion_leads SET review_reported_at=?1 WHERE receipt_id=?2 AND review_reported_at IS NULL').bind(now,lead.receipt_id).run();
  return reply({reported:true,message:'Thank you. Your note is received and Erik’s notification is queued.'});
}
