import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { intakeUrl, resetChallenge } from '../lib/intake';
import { emailError, phoneError } from '../lib/contact-input';
import SecurityCheck from './SecurityCheck';

export default function CostGuideForm() {
  const [title,setTitle]=useState(''); const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [phone,setPhone]=useState('');
  const [consent,setConsent]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const [receipt,setReceipt]=useState(''); const [download,setDownload]=useState('');
  const form=useRef<HTMLFormElement>(null); const attempt=useRef<{key:string;payload:Record<string,unknown>}|null>(null);
  useEffect(()=>{if(intakeUrl)fetch(`${intakeUrl}/conversion/public`).then(r=>r.json()).then(c=>setTitle(c.guide?.title??'')).catch(()=>{});},[]);
  if(!title)return null;
  async function submit(event:SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();if(busy||receipt)return;
    if(!name.trim()||!email.trim()||emailError(email)||phoneError(phone)){setError('Enter your name and a valid email address. Phone is optional.');return;}
    setBusy(true);setError('');
    attempt.current??={key:crypto.randomUUID(),payload:{name:name.trim(),email:email.trim(),...(phone.trim()?{phone:phone.trim()}:{}),followupConsent:consent}};
    try {
      const token=form.current?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value??'';
      const response=await fetch(`${intakeUrl}/intake/lead-magnet`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':attempt.current.key},body:JSON.stringify({...attempt.current.payload,turnstileToken:token}),signal:AbortSignal.timeout(30000)});
      const result=await response.json();
      if(response.status!==202||typeof result.receiptId!=='string'||typeof result.downloadUrl!=='string')throw new Error('We could not confirm your guide request. Complete the security check and retry with the same details.');
      setReceipt(result.receiptId);setDownload(result.downloadUrl);
    }catch(e){setError(e instanceof Error?e.message:'Please try again.');resetChallenge();}finally{setBusy(false);}
  }
  async function downloadGuide(){setBusy(true);setError('');try{const r=await fetch(download);if(r.status===425){setError('Your request is received. The guide will be ready once it is recorded. Please try the download again shortly.');return;}if(!r.ok)throw new Error('The guide is unavailable. Call (208) 608-4439 for help.');const blob=await r.blob();const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='miller-remodeling-cost-guide.txt';link.click();URL.revokeObjectURL(url);}catch(e){setError(e instanceof Error?e.message:'Please retry the download.');}finally{setBusy(false);}}
  return <section className="contact-preview" aria-labelledby="cost-guide-title"><div className="contact-intro"><p className="eyebrow">Before you plan</p><h2 id="cost-guide-title">{title}</h2><p>Get Erik’s guide to scope, design, and planning ranges. It helps you prepare for a conversation; it is not a quote.</p></div><form className="contact-card" ref={form} onSubmit={submit} noValidate>
    {!receipt?<><fieldset disabled={busy||Boolean(attempt.current)} style={{border:0,padding:0}}><label htmlFor="guide-name">Name</label><input id="guide-name" maxLength={120} value={name} onChange={e=>setName(e.currentTarget.value)}/><label htmlFor="guide-email">Email</label><input id="guide-email" type="email" maxLength={254} value={email} onChange={e=>setEmail(e.currentTarget.value)}/><label htmlFor="guide-phone">Phone (optional)</label><input id="guide-phone" type="tel" maxLength={32} value={phone} onChange={e=>setPhone(e.currentTarget.value)}/><label className="followup-choice"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.currentTarget.checked)}/><span>I’d like up to three planning follow-ups by email over fourteen days. I can unsubscribe at any time.</span></label></fieldset><SecurityCheck/><button className="button" disabled={busy}>{busy?'Requesting…':attempt.current?'Retry request':'Get the cost guide'}</button><p className="field-hint">Your details record this guide request with Miller Remodeling. Follow-up emails are optional.</p></>:<><p role="status">Your request is received. Reference: {receipt}</p><button type="button" className="button" disabled={busy} onClick={downloadGuide}>{busy?'Preparing…':'Download the guide'}</button></>}
    {error&&<p role="alert">{error}</p>}
  </form></section>;
}
