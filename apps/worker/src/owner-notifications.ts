export interface OwnerNotificationEnvironment {
  INTAKE_DB?: D1Database;
  OWNER_EMAIL_ENABLED?: string;
  OWNER_NOTIFICATION_EMAIL?: {send(message:{to:string;from:string;subject:string;text:string}):Promise<{messageId:string}>};
}

const recipient = 'erik@millerremodelingidaho.com';
const sender = 'website@notify.millerremodelingidaho.com';

export async function queueOwnerNotice(env:OwnerNotificationEnvironment, receiptId:string):Promise<void> {
  if(env.OWNER_EMAIL_ENABLED!=='true' || !env.INTAKE_DB)return;
  const result=await env.INTAKE_DB.prepare('INSERT OR IGNORE INTO owner_notifications(receipt_id,updated_at) VALUES(?1,?2)').bind(receiptId,new Date().toISOString()).run();
  if(!result.success)throw Error('owner_notice_queue_failed');
}

export async function deliverOwnerNotice(env:OwnerNotificationEnvironment, receiptId:string):Promise<void> {
  const db=env.INTAKE_DB, email=env.OWNER_NOTIFICATION_EMAIL;
  if(env.OWNER_EMAIL_ENABLED!=='true'||!db||!email)return;
  const row=await db.prepare(`SELECT n.state,n.attempts,s.payload,r.reference FROM owner_notifications n
    JOIN intake_submissions s ON s.receipt_id=n.receipt_id
    JOIN intake_public_references r ON r.receipt_id=n.receipt_id WHERE n.receipt_id=?1`)
    .bind(receiptId).first<{state:string;attempts:number;payload:string|null;reference:string}>();
  if(!row || row.state!=='pending' || !row.payload)return;
  const claim=await db.prepare("UPDATE owner_notifications SET state='sending',attempts=attempts+1,updated_at=?1 WHERE receipt_id=?2 AND state='pending'")
    .bind(new Date().toISOString(),receiptId).run();
  if(!claim.success||claim.meta?.changes!==1)return;
  try {
    const p=JSON.parse(row.payload) as {name?:string;email?:string;phone?:string;message?:string;photos?:unknown[];project?:unknown};
    const lines=[`New ${p.project?'project inquiry':'contact inquiry'}: ${row.reference}`,`Name: ${p.name??''}`,
      `Email: ${p.email??'Not supplied'}`,`Phone: ${p.phone??'Not supplied'}`,'',p.message??'', '',
      `Photos: ${p.photos?.length??0}. Find the inquiry in JobTread using ${row.reference}.`];
    const result=await email.send({to:recipient,from:sender,subject:`New website inquiry ${row.reference}`,text:lines.join('\n')});
    if(!result?.messageId)throw Error('owner_notice_result_unknown');
    await db.prepare("UPDATE owner_notifications SET state='sent',provider_id=?1,updated_at=?2 WHERE receipt_id=?3 AND state='sending'")
      .bind(result.messageId,new Date().toISOString(),receiptId).run();
  } catch(error) {
    const code=(error && typeof error==='object' && 'code' in error)?String(error.code):'';
    const retryable=['E_RATE_LIMIT_EXCEEDED','E_DAILY_LIMIT_EXCEEDED'].includes(code) && row.attempts<4;
    await db.prepare("UPDATE owner_notifications SET state=?1,error_category=?2,updated_at=?3 WHERE receipt_id=?4 AND state='sending'")
      .bind(retryable?'pending':'unknown',retryable?'rate_limited':'send_outcome_unknown',new Date().toISOString(),receiptId).run();
  }
}

export async function retryOwnerNotices(env:OwnerNotificationEnvironment):Promise<void> {
  if(env.OWNER_EMAIL_ENABLED!=='true'||!env.INTAKE_DB||!env.OWNER_NOTIFICATION_EMAIL)return;
  const db=env.INTAKE_DB;
  const stale=new Date(Date.now()-10*60_000).toISOString();
  await db.prepare("UPDATE owner_notifications SET state='unknown',error_category='send_outcome_unknown',updated_at=?1 WHERE state='sending' AND updated_at<?2").bind(new Date().toISOString(),stale).run();
  const due=await db.prepare("SELECT receipt_id FROM owner_notifications WHERE state='pending' ORDER BY updated_at LIMIT 50").all<{receipt_id:string}>();
  for(const row of due.results)await deliverOwnerNotice(env,row.receipt_id);
}
