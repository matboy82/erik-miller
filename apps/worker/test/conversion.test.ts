import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { approvedConversion, captureConversion, captureCompletedJob, cleanupConversion, conversionOperator, conversionPublic, defaultConversionConfig, nurtureSchedule, runConversion, stopNurture, validConversionConfig, type ConversionConfig } from '../src/conversion.ts';
import worker from '../src/index.ts';

const receipt='e8a60851-8b75-421c-b422-38dc80603179';
const start=Date.parse('2026-10-05T12:00:00Z');
const day=86400_000;
function database(){
  const sql=new DatabaseSync(':memory:');
  for(const name of ['0001_intake.sql','0002_photos.sql','0003_bookings.sql','0004_calendar_sync.sql','0005_lead_conversion.sql'])sql.exec(readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8'));
  const db={prepare(query:string){let values:unknown[]=[];return {bind(...args:unknown[]){values=args;return this;},async first(){return sql.prepare(query).get(...values)??null;},async all(){return {results:sql.prepare(query).all(...values)};},async run(){const result=sql.prepare(query).run(...values);return {success:true,meta:{changes:Number(result.changes)}};}};},async batch(statements:{run:()=>Promise<unknown>}[]){sql.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}};
  return {sql,db:db as unknown as D1Database};
}
function config():ConversionConfig{return {...structuredClone(defaultConversionConfig),sender:'erik@example.com',postalAddress:'Owner-approved business mailing address',nurture:{enabled:true,touches:[{day:3,subject:'Checking in',text:'Would you like to talk about your project?'},{day:8,subject:'Planning your project',text:'You can review our design process before choosing a consultation.'},{day:14,subject:'We’ll leave it here',text:'We’ll stop these follow-ups here. Reach out when you are ready.'}]}};}
async function setup(c=config()){
  const {sql,db}=database();const sent:{to:string;text:string}[]=[];const timeline:Record<string,unknown>[]=[];
  sql.prepare('INSERT INTO conversion_config(id,revision,draft,approved,approved_by,approved_at) VALUES(1,?,?,?,?,?)').run('revision',JSON.stringify(c),JSON.stringify(c),'millerremodelingidaho@gmail.com',new Date(start).toISOString());
  sql.prepare(`INSERT INTO intake_submissions(receipt_id,idempotency_key,state,created_at,updated_at,delivered_at,payload_expires_at,metadata_expires_at,payload,external_job_id) VALUES(?,?,'delivered',?,?,?,?,?,?,?)`).run(receipt,receipt,new Date(start).toISOString(),new Date(start).toISOString(),new Date(start).toISOString(),new Date(start+30*day).toISOString(),new Date(start+90*day).toISOString(),JSON.stringify({name:'Test homeowner',email:'homeowner@example.com',message:'Test'}),'job-one');
  const env={INTAKE_DB:db,CONVERSION_ENABLED:'true',BOOKING_SYNC_ENABLED:'true',EMAIL:{async send(m:{to:string;text:string}){sent.push(m);return {messageId:`email-${sent.length}`};}}};
  await captureConversion(env,receipt,{email:'homeowner@example.com',followupConsent:true});
  const call=async(operation:Record<string,unknown>)=>{if(operation.createComment){timeline.push(operation);return {createComment:{createdComment:{id:'comment-one',job:{id:'job-one'}}}};}return {job:{id:'job-one',closedOn:null}};};
  return {sql,db,sent,timeline,env,call};
}
test('configuration rejects invented activation paths, unbounded nurture, invalid bands and unsafe review links',()=>{
  assert.ok(validConversionConfig(defaultConversionConfig));assert.ok(validConversionConfig(config()));
  for(const value of [{...config(),sms:true},{...config(),nurture:{enabled:true,touches:[{day:15,subject:'No',text:'No'}]}},{...config(),nurture:{enabled:true,touches:Array(4).fill({day:3,subject:'No',text:'No'})}},{...config(),budgetBands:[{projectType:'Kitchen',min:100,max:50,scope:'Example'}]},{...config(),reviews:{...defaultConversionConfig.reviews,links:[{label:'Google',url:'https://attacker.example/review'}]}},{...config(),postalAddress:''}])assert.equal(validConversionConfig(value),false);
  const last=nurtureSchedule(config(),start).at(-1)!;assert.equal(last.dueAt,new Date(start+14*day).toISOString());assert.ok(Date.parse(last.expiresAt)>Date.parse(last.dueAt));
});
test('three scheduled touches, verified job first, internal JobTread timeline, then permanent silence',async()=>{
  const s=await setup();await runConversion(s.env,s.call,start);assert.equal(s.sent.length,0);
  for(const n of [3,8,14]){await runConversion(s.env,s.call,start+n*day+5*60000);await runConversion(s.env,s.call,start+n*day+10*60000);}
  assert.equal(s.sent.length,3);assert.equal(s.timeline.length,3);
  assert.ok(s.sent.every(m=>m.text.includes('Stop these follow-ups:')));
  await runConversion(s.env,s.call,start+30*day);assert.equal(s.sent.length,3);
  const comment=(s.timeline[0].createComment as {$:Record<string,unknown>}).$;assert.equal(comment.isVisibleToCustomerRoles,false);assert.equal(comment.targetId,'job-one');
});
test('booking waiting for JobTread synchronization stops nurture before sending',async()=>{
  const s=await setup();await runConversion(s.env,s.call,start);
  s.sql.prepare('INSERT INTO calendar_booking_events(event_id,receipt_id,payload,updated_at) VALUES(?,?,?,?)').run('booking',receipt,'{}',new Date(start).toISOString());
  await runConversion(s.env,s.call,start+3*day);assert.equal(s.sent.length,0);
  assert.equal(s.sql.prepare('SELECT stop_reason FROM conversion_leads').get()?.stop_reason,'consultation_booked');
});
test('unsubscribe stops pending touches immediately, including after a prior booking stop',async()=>{
  const s=await setup();await runConversion(s.env,s.call,start);await stopNurture(s.db,receipt,'consultation_booked');
  const token=s.sql.prepare('SELECT unsubscribe_token FROM conversion_leads').get()!.unsubscribe_token;
  const url=`https://worker.test/conversion/unsubscribe?token=${token}`;
  assert.equal((await conversionPublic(new Request(url),s.env)).status,200);
  assert.equal((await conversionPublic(new Request(url,{method:'POST'}),s.env)).status,200);
  assert.equal(s.sql.prepare('SELECT stop_reason FROM conversion_leads').get()?.stop_reason,'unsubscribed');
  await runConversion(s.env,s.call,start+8*day);assert.equal(s.sent.length,0);
});
test('missing consent, inactive calendar, disabled feature, and undelivered lead cannot send',async()=>{
  for(const scenario of ['consent','calendar','feature','delivered']){
    const s=await setup();if(scenario==='consent')s.sql.exec('UPDATE conversion_leads SET nurture_consent=0');
    if(scenario==='calendar')s.env.BOOKING_SYNC_ENABLED='false';if(scenario==='feature')s.env.CONVERSION_ENABLED='false';
    if(scenario==='delivered')s.sql.exec("UPDATE intake_submissions SET state='accepted'");
    await runConversion(s.env,s.call,start);await runConversion(s.env,s.call,start+3*day);assert.equal(s.sent.length,0,scenario);
  }
});
test('ambiguous provider failure holds for review instead of duplicating email',async()=>{
  const s=await setup();await runConversion(s.env,s.call,start);let attempts=0;
  s.env.EMAIL.send=async()=>{attempts++;throw new Error('Do not log provider secrets');};
  await runConversion(s.env,s.call,start+3*day);await runConversion(s.env,s.call,start+3*day+3600000);
  assert.equal(attempts,1);assert.equal(s.sql.prepare("SELECT state FROM conversion_messages WHERE kind='nurture_3'").get()?.state,'unknown');
  assert.equal(s.sql.prepare('SELECT state FROM intake_submissions').get()?.state,'delivered');
});
test('draft edits invalidate approval; only Erik may approve the exact current revision',async()=>{
  const s=await setup();const url='https://worker.test/operator/conversion/config';
  const result=await conversionOperator(new Request(url,{method:'PUT',body:JSON.stringify(config())}),s.env,'matt.boyer@boyerimpactsystems.com');
  const {revision}=await result.json() as {revision:string};assert.equal(await approvedConversion(s.env),null);
  const approve=(rev:string)=>new Request('https://worker.test/operator/conversion/approve',{method:'POST',body:JSON.stringify({revision:rev})});
  assert.equal((await conversionOperator(approve(revision),s.env,'matt.boyer@boyerimpactsystems.com')).status,403);
  assert.equal((await conversionOperator(approve('old'),s.env,'millerremodelingidaho@gmail.com')).status,409);
  assert.equal((await conversionOperator(approve(revision),s.env,'millerremodelingidaho@gmail.com')).status,200);assert.ok(await approvedConversion(s.env));
  assert.equal((await worker.fetch(new Request(url),s.env)).status,401);
});
test('guide capture stores both contacts, types JobTread payload, and waits for verified delivery before download',async()=>{
  const c=config();c.guide={enabled:true,title:'Approved guide',text:'Scope and design planning.'};const s=await setup(c);
  const key=crypto.randomUUID();const request=()=>new Request('https://worker.test/intake/lead-magnet',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key,Origin:'https://web.test'},body:JSON.stringify({name:'Guide homeowner',email:'guide@example.com',phone:'(208) 555-0123',followupConsent:false})});
  const env={...s.env,INTAKE_ENABLED:'true',INTAKE_MODE:'synthetic',ALLOWED_ORIGINS:'https://web.test',INTAKE_QUEUE:{send:async()=>{}} as unknown as Queue<string>};
  const response=await worker.fetch(request(),env);assert.equal(response.status,202);const body=await response.json() as {receiptId:string;downloadUrl:string};
  const row=s.sql.prepare('SELECT payload FROM intake_submissions WHERE receipt_id=?').get(body.receiptId)!;const payload=JSON.parse(String(row.payload));assert.equal(payload.leadType,'lead_magnet');assert.equal(payload.phone,'+12085550123');
  assert.equal((await worker.fetch(new Request(body.downloadUrl,{headers:{Origin:'https://web.test'}}),env)).status,425);
  s.sql.prepare("UPDATE intake_submissions SET state='delivered', external_job_id='job-guide' WHERE receipt_id=?").run(body.receiptId);
  const download=await worker.fetch(new Request(body.downloadUrl,{headers:{Origin:'https://web.test'}}),env);assert.equal(download.status,200);assert.equal(download.headers.get('Access-Control-Allow-Origin'),'https://web.test');assert.match(await download.text(),/Scope and design planning/);
  assert.equal((await worker.fetch(request(),env)).status,202);assert.equal(s.sql.prepare('SELECT count(*) n FROM conversion_leads WHERE receipt_id=?').get(body.receiptId)?.n,1);
});
test('confirmed closure schedules a neutral review ask and a reported review queues thanks and owner notification only once',async()=>{
  const c=config();c.nurture.enabled=false;c.reviews={enabled:true,delayDays:0,links:[{label:'Google',url:'https://g.page/example/review'}],subject:'Share your feedback',ask:'Please share an honest review. Feedback is optional.',thanks:'Thank you for sharing your feedback.'};
  const s=await setup(c);const call=async(o:Record<string,unknown>)=>o.job?{job:{id:'job-one',closedOn:'2026-10-05'}}:s.call(o);
  await runConversion(s.env,call,start);await runConversion(s.env,call,start+day);assert.equal(s.sent.length,1);assert.match(s.sent[0].text,/Feedback is optional/);
  const token=s.sql.prepare('SELECT unsubscribe_token FROM conversion_leads').get()!.unsubscribe_token;
  const report=()=>new Request(`https://worker.test/conversion/review?token=${token}`,{method:'POST'});
  assert.equal((await conversionPublic(report(),s.env)).status,200);assert.equal((await conversionPublic(report(),s.env)).status,200);
  assert.equal(s.sql.prepare('SELECT count(*) n FROM conversion_messages').get()?.n,3);
  // No testimonial/publication table is written; a report is explicitly unverified.
});
test('native completion events verify job/contact ownership and deduplicate jobs outside website intake',async()=>{
  const c=config();c.reviews={enabled:true,delayDays:3,links:[{label:'Google',url:'https://g.page/example/review'}],subject:'Review',ask:'Share an honest review.',thanks:'Thank you.'};const s=await setup(c);
  const env={...s.env,JOBTREAD_ORGANIZATION_ID:'owner-org',JOBTREAD_EMAIL_CUSTOM_FIELD_ID:'email-field'};
  const result={job:{id:'completed-job',closedOn:new Date().toISOString().slice(0,10),organization:{id:'owner-org'},location:{account:{id:'customer-account'}}},contact:{id:'customer-contact',account:{id:'customer-account'},customFieldValues:{nodes:[{customField:{id:'email-field'},value:'customer@example.com'}]}}};
  const captured=await captureCompletedJob(env,async()=>result,'completed-job','customer-contact');
  assert.equal((await captureCompletedJob(env,async()=>{throw new Error('must not duplicate');},'completed-job','customer-contact')).receiptId,captured.receiptId);
  assert.equal(s.sql.prepare('SELECT count(*) n FROM conversion_review_jobs').get()?.n,1);
  const foreign={...result,job:{...result.job,id:'foreign-job',organization:{id:'another-org'}}};
  await assert.rejects(()=>captureCompletedJob(env,async()=>foreign,'foreign-job','customer-contact'),/completion_readback_failed/);
  assert.equal((await worker.fetch(new Request('https://worker.test/conversion/job-completed',{method:'POST',body:'{}'}),env)).status,401);
});
test('thirty-day retention clears duplicate contact data and guide contents',async()=>{
  const s=await setup();await runConversion(s.env,s.call,start);
  s.sql.prepare('UPDATE intake_submissions SET created_at=? WHERE receipt_id=?').run(new Date(Date.now()-31*day).toISOString(),receipt);
  await cleanupConversion(s.db);assert.equal(s.sql.prepare('SELECT email FROM conversion_leads').get()?.email,null);
  assert.equal(s.sql.prepare('SELECT body FROM conversion_messages LIMIT 1').get()?.body,'');
});
