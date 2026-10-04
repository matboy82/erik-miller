import { useRef, useState, type SyntheticEvent } from 'react';
import { emailError, phoneError, formatPhone } from '../lib/contact-input';
import { intakeUrl, sendInquiry, resetChallenge } from '../lib/intake';
import SecurityCheck from './SecurityCheck';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [received, setReceived] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const attempt = useRef<{ key: string; payload: Record<string, unknown> } | null>(null);
  const form = useRef<HTMLFormElement>(null);

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || received) return;
    const issues = [!name.trim() ? 'Enter your name.' : '', !email.trim() && !phone.trim() ? 'Enter an email address or phone number.' : '',
      email.trim() && phone.trim() ? 'Choose email or phone as your contact method.' : '', emailError(email), phoneError(phone), !message.trim() ? 'Tell us what you would like help with.' : ''].filter(Boolean);
    setErrors(issues);
    if (issues.length) return;
    setBusy(true); setStatus('Sending your inquiry…');
    attempt.current ??= { key: crypto.randomUUID(), payload: { name: name.trim(), ...(email.trim() ? { email: email.trim() } : { phone: phone.trim() }), message: message.trim() } };
    try {
      const token = form.current?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value ?? '';
      const receipt = await sendInquiry('contact', attempt.current.payload, attempt.current.key, token);
      setReceived(true); setStatus(`Thank you. We received your inquiry and will follow up. Your reference is ${receipt}.`);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Please try again or call (208) 608-4439.']);
      setStatus(''); resetChallenge();
    } finally { setBusy(false); }
  }

  return <section className="contact-preview" aria-labelledby="contact-title">
    <div className="contact-intro"><p className="eyebrow">General inquiries</p><h2 id="contact-title">Let’s make room for your next chapter.</h2><p>Tell us what you have in mind. We’ll take it from there.</p></div>
    <form ref={form} className="contact-card" onSubmit={submit} noValidate>
      {!intakeUrl && <p className="demo-note">This form is being prepared for launch. Call (208) 608-4439 for now.</p>}
      <fieldset disabled={busy || received || Boolean(attempt.current)} style={{ border: 0, padding: 0, margin: 0 }}>
        <label htmlFor="inquiry-name">Your name</label><input id="inquiry-name" autoComplete="name" maxLength={120} value={name} onChange={(event) => setName(event.currentTarget.value)} required />
        <label htmlFor="inquiry-email">Email</label><input id="inquiry-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.currentTarget.value)} />
        <label htmlFor="inquiry-phone">Phone</label><input id="inquiry-phone" type="tel" autoComplete="tel" maxLength={32} value={phone} onChange={(event) => setPhone(formatPhone(event.currentTarget.value))} />
        <p className="field-hint">Choose one way to reach you: email or phone.</p>
        <label htmlFor="inquiry-message">What would you like help with?</label><textarea id="inquiry-message" rows={5} maxLength={5000} value={message} onChange={(event) => setMessage(event.currentTarget.value)} required />
      </fieldset>
      {!received && <SecurityCheck />}
      {errors.length > 0 && <div role="alert" className="wizard-errors"><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
      {!received && <button type="submit" className="button" disabled={busy}>{busy ? 'Sending…' : attempt.current ? 'Retry inquiry' : 'Send inquiry'}</button>}
      <p className="form-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
      {attempt.current && !busy && !received && <button type="button" className="wizard-clear" onClick={() => { attempt.current = null; setErrors([]); setStatus('You may edit the details. An earlier attempt may still have been received; call us if you need to check.'); }}>Edit as a new inquiry</button>}
      <p className="field-hint">Your details are used to respond to this inquiry.</p>
    </form>
  </section>;
}
