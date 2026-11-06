import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { queueOwnerNotice, deliverOwnerNotice } from '../src/owner-notifications.ts';

function setup() {
  const sql = new DatabaseSync(':memory:');
  for (const name of ['0001_intake.sql','0006_public_references.sql','0008_owner_notifications.sql']) sql.exec(readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8'));
  const db={prepare(query:string){const statement=sql.prepare(query);let values:unknown[]=[];const args=()=>Object.fromEntries(values.map((value,index)=>[String(index+1),value]));return {bind(...input:unknown[]){values=input;return this;},async first(){return statement.get(args())??null;},async all(){return {results:statement.all(args())};},async run(){const r=statement.run(args());return {success:true,meta:{changes:Number(r.changes)}};}};}} as unknown as D1Database;
  const receipt='11111111-1111-4111-8111-111111111111',reference='MR-ABCDE-23456';
  const payload={name:'Test homeowner',email:'test@example.invalid',phone:'+12085550100',message:'A test project',photos:[]};
  const now=new Date().toISOString();
  sql.prepare('INSERT INTO intake_submissions(receipt_id,idempotency_key,state,created_at,updated_at,payload_expires_at,metadata_expires_at,payload) VALUES(?,?,?,?,?,?,?,?)').run(receipt,receipt,'accepted',now,now,now,now,JSON.stringify(payload));
  sql.prepare('INSERT INTO intake_public_references(reference,receipt_id,created_at) VALUES(?,?,?)').run(reference,receipt,now);
  return {sql,db,receipt,reference,payload};
}
test('owner notification sends once with the inquiry and reference, independently of conversion approval',async()=>{
  const s=setup();const messages:{to:string;from:string;subject:string;text:string}[]=[];
  const env={INTAKE_DB:s.db,OWNER_EMAIL_ENABLED:'true',OWNER_NOTIFICATION_EMAIL:{async send(m:typeof messages[number]){messages.push(m);return {messageId:'test-message'};}}};
  await queueOwnerNotice(env,s.receipt);await queueOwnerNotice(env,s.receipt);
  await deliverOwnerNotice(env,s.receipt);await deliverOwnerNotice(env,s.receipt);
  assert.equal(messages.length,1);assert.equal(messages[0].to,'erik@millerremodelingidaho.com');
  assert.match(messages[0].subject,new RegExp(s.reference));assert.match(messages[0].text,/Test homeowner/);assert.match(messages[0].text,/test@example.invalid/);assert.match(messages[0].text,/A test project/);
  assert.equal(s.sql.prepare('SELECT state FROM owner_notifications').get()?.state,'sent');
});
test('unconfigured or ambiguous send never marks delivery successful or blindly retries',async()=>{
  const s=setup();const base={INTAKE_DB:s.db,OWNER_EMAIL_ENABLED:'true'};
  await queueOwnerNotice(base,s.receipt);await deliverOwnerNotice(base,s.receipt);
  assert.equal(s.sql.prepare('SELECT state FROM owner_notifications').get()?.state,'pending');
  let calls=0;const env={...base,OWNER_NOTIFICATION_EMAIL:{async send(){calls++;throw Error('network lost');}}};
  await deliverOwnerNotice(env,s.receipt);await deliverOwnerNotice(env,s.receipt);
  assert.equal(calls,1);assert.equal(s.sql.prepare('SELECT state FROM owner_notifications').get()?.state,'unknown');
});
