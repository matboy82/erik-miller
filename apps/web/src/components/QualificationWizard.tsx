import { useEffect, useMemo, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { emailError, phoneError, formatPhone } from '../lib/contact-input';
import { intakeUrl, bookingUrl, preparePhoto, sendInquiry, resetChallenge } from '../lib/intake';
import SecurityCheck from './SecurityCheck';
import CostGuideForm from './CostGuideForm';

type SelectionKey = 'projectType' | 'location' | 'timeline' | 'budget' | 'experience' | 'referralSource';
type SelectionValues = Record<SelectionKey, string>;
type WizardValues = SelectionValues & {
  description: string;
  name: string;
  email: string;
  phone: string;
  photoName: string;
};

const storageKey = 'miller-review-qualification-v1';
const emptySelections: SelectionValues = {
  projectType: '', location: '', timeline: '', budget: '', experience: '', referralSource: '',
};
const emptyValues: WizardValues = {
  ...emptySelections, description: '', name: '', email: '', phone: '', photoName: '',
};
const steps = ['Project', 'Location', 'Timing and budget', 'Project details', 'Contact', 'Next steps'];
const projectTypes = ['Kitchen', 'Bathroom', 'Whole home', 'Addition', 'ADU or mother-in-law space', 'Home repair', 'Another project'];
const locations = ['Eagle', 'Star', 'Meridian', 'Boise', 'Middleton', 'Kuna', 'Another area', 'Not sure yet'];
const timelineOptions = ['Still exploring', 'I have a target timeframe', 'I would like to discuss timing'];
const budgetOptions = ['Still estimating', 'I have a range in mind', 'I would like to discuss budget'];
const referralOptions = ['Search', 'A recommendation', 'Social media', 'Another source', 'Prefer not to say'];
const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
const selectionOptions: Record<SelectionKey, string[]> = {
  projectType: projectTypes,
  location: locations,
  timeline: timelineOptions,
  budget: budgetOptions,
  experience: ['Yes', 'No', 'Not sure'],
  referralSource: referralOptions,
};
const nonSensitiveKeys: SelectionKey[] = ['projectType', 'location', 'timeline', 'budget', 'experience', 'referralSource'];

function selectionSnapshot(values: WizardValues): SelectionValues {
  return Object.fromEntries(nonSensitiveKeys.map((key) => [key, values[key]])) as SelectionValues;
}

function validSnapshot(value: unknown): value is { step: number; selections: SelectionValues } {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { step?: unknown; selections?: unknown };
  if (!Number.isInteger(candidate.step) || Number(candidate.step) < 0 || Number(candidate.step) > 5
      || !candidate.selections || typeof candidate.selections !== 'object') return false;
  const selections = candidate.selections as Record<string, unknown>;
  return nonSensitiveKeys.every((key) => typeof selections[key] === 'string'
    && (selections[key] === '' || selectionOptions[key].includes(selections[key] as string)));
}

export default function QualificationWizard() {
  const [values, setValues] = useState<WizardValues>(emptyValues);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [contactTouched, setContactTouched] = useState({ name: false, email: false, phone: false });
  const [outcome, setOutcome] = useState('');
  const [sending, setSending] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [copied, setCopied] = useState(false);
  const attempt = useRef<{ key: string; payload: Record<string, unknown> } | null>(null);
  const [bookingLoaded, setBookingLoaded] = useState(false);
  const [bands,setBands]=useState<{projectType:string;min:number;max:number;scope:string}[]>([]);
  const [followupConsent,setFollowupConsent]=useState(false);
  const selectedBand=bands.find(b=>b.projectType===values.projectType);
  useEffect(()=>{if(intakeUrl)fetch(`${intakeUrl}/conversion/public`).then(r=>r.json()).then(c=>setBands(Array.isArray(c.budgetBands)?c.budgetBands:[])).catch(()=>{});},[]);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const progress = useMemo(() => `${Math.round(((step + 1) / steps.length) * 100)}%`, [step]);
  const formRef = useRef<HTMLFormElement>(null);
  const previousStep = useRef(step);
  const contactErrors = {
    name: values.name.trim() ? '' : 'Enter your name.',
    email: emailError(values.email),
    phone: phoneError(values.phone),
  };
  const contactChoiceError = Boolean(values.email.trim()) === Boolean(values.phone.trim())
    ? 'Enter either an email address or a phone number.' : '';
  const showContactChoiceError = contactTouched.email && contactTouched.phone && Boolean(contactChoiceError);

  function touchContact(key: 'name' | 'email' | 'phone') {
    setContactTouched((current) => ({ ...current, [key]: true }));
    if (key === 'email') update('email', values.email.trim());
    if (key === 'phone') update('phone', formatPhone(values.phone));
  }

  useEffect(() => {
    if (previousStep.current !== step) {
      formRef.current?.querySelector<HTMLElement>('legend, h3')?.focus();
      previousStep.current = step;
    }
  }, [step]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (validSnapshot(parsed)) {
          setValues((current) => ({ ...current, ...parsed.selections }));
          setStep(Math.min(parsed.step, 3));
        }
      }
    } catch {
      // Storage can be unavailable; the in-memory demo remains usable.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ step, selections: selectionSnapshot(values) }));
    } catch {
      // Storage is optional and never blocks the review flow.
    }
  }, [ready, step, values]);

  function update(key: keyof WizardValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors([]);
    setOutcome('');
    setBookingLoaded(false);
  }

  function validateCurrentStep(): string[] {
    if (step === 0 && !values.projectType) return ['Choose a project type to continue.'];
    if (step === 1 && !values.location) return ['Choose a location to continue.'];
    if (step === 2 && (!values.timeline || !values.budget)) return ['Choose a timing and budget option to continue.'];
    if (step === 3) {
      const issues: string[] = [];
      if (!values.description.trim()) issues.push('Add a short project description.');
      if (values.description.length > 5000) issues.push('Keep the project description under 5,000 characters.');
      if (!values.experience || !values.referralSource) issues.push('Complete both questions to continue.');
      return issues;
    }
    if (step === 4) {
      const issues: string[] = [];
      if (contactErrors.name) issues.push(contactErrors.name);
      if (contactChoiceError) issues.push(contactChoiceError);
      if (contactErrors.email) issues.push(contactErrors.email);
      if (contactErrors.phone) issues.push(contactErrors.phone);
      return issues;
    }
    return [];
  }

  function advance(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 4) setContactTouched({ name: true, email: true, phone: true });
    const issues = validateCurrentStep();
    if (issues.length) {
      setErrors(issues);
      return;
    }
    setErrors([]);
    setOutcome('');
    setBookingLoaded(false);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function clearProgress() {
    try { window.localStorage.removeItem(storageKey); } catch { /* Optional storage. */ }
    setValues(emptyValues);
    setStep(0);
    setErrors([]);
    setOutcome('');
    setBookingLoaded(false);
    setPhotoInputKey((current) => current + 1);
    setContactTouched({ name: false, email: false, phone: false });
    setPhotos([]);
    setCopied(false);
    setFollowupConsent(false);
    attempt.current = null;
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.currentTarget.files ?? []);
    if (selected.length > 3 || selected.some((file) => !allowedPhotoTypes.includes(file.type) || file.size > 20 * 1024 * 1024)) {
      setValues((current) => ({ ...current, photoName: '' }));
      setErrors(['Choose up to three JPEG, PNG, or WebP photos under 20 MB each.']);
      setPhotos([]);
      setPhotoInputKey((current) => current + 1);
      return;
    }
    setPhotos(selected);
    update('photoName', selected.map((file) => file.name).join(', '));
  }

  async function submitProject() {
    if (sending || outcome) return;
    setErrors([]); setSending(true);
    try {
      if (!attempt.current) {
        attempt.current = { key: crypto.randomUUID(), payload: {
          name: values.name.trim(), ...(values.email.trim() ? { email: values.email.trim() } : { phone: values.phone.trim() }),
          project: { ...selectionSnapshot(values), description: values.description.trim() },
          photos: await Promise.all(photos.map(preparePhoto)),
          followupConsent: Boolean(values.email.trim() && followupConsent),
        } };
      }
      const token = formRef.current?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value ?? '';
      const receipt = await sendInquiry('project', attempt.current.payload, attempt.current.key, token);
      setOutcome(receipt);
      try { window.localStorage.removeItem(storageKey); } catch { /* Optional storage. */ }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'We could not confirm receipt. Try again or call (208) 608-4439.']);
      resetChallenge();
    } finally { setSending(false); }
  }

  const selection = (key: SelectionKey, label: string, options: string[]) => (
    <label className="wizard-field" htmlFor={`qualification-${key}`}>
      <span>{label}</span>
      <select id={`qualification-${key}`} value={values[key]} onChange={(event) => update(key, event.currentTarget.value)}>
        <option value="">Choose an option</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );

  return (
    <section className="qualification" aria-label="Project questions">
      {!intakeUrl && <p className="demo-note">This form is being prepared for launch. You can explore the questions, or call (208) 608-4439.</p>}


      <div className="wizard-progress">
        <div className="wizard-progress-row">
          <span>Step {step + 1} of {steps.length}: {steps[step]}</span>
          <span>{progress}</span>
        </div>
        <progress value={step + 1} max={steps.length} aria-label={`Step ${step + 1} of ${steps.length}`} />
        <ol className="wizard-step-list" aria-label="Qualification preview steps">
          {steps.map((name, index) => <li key={name} aria-current={index === step ? 'step' : undefined} className={index === step ? 'is-current' : ''}>{name}</li>)}
        </ol>
      </div>

      <form className="wizard-card" ref={formRef} onSubmit={advance} noValidate>
        {step === 0 && <fieldset>
          <legend tabIndex={-1}>What kind of project would you like to explore?</legend>
          {selection('projectType', 'Project type', projectTypes)}

        </fieldset>}

        {step === 1 && <fieldset>
          <legend tabIndex={-1}>Where is the property?</legend>
          {selection('location', 'Project location', locations)}

        </fieldset>}

        {step === 2 && <fieldset>
          <legend tabIndex={-1}>What timing and budget details are useful to discuss?</legend>
          {selection('timeline', 'Timing', timelineOptions)}
          {selection('budget', 'Budget', budgetOptions)}

        </fieldset>}

        {step === 3 && <fieldset>
          <legend tabIndex={-1}>Tell us a little more</legend>
          <label className="wizard-field" htmlFor="qualification-description">
            <span>Project description</span>
            <textarea id="qualification-description" rows={5} maxLength={5000} aria-invalid={errors.length > 0 && step === 3 && !values.description.trim()} value={values.description} onChange={(event) => update('description', event.currentTarget.value)} placeholder="What would you like to change, and what matters most to you?" />
          </label>
          <label className="wizard-field" htmlFor="qualification-photo">
            <span>Optional project photos</span>
            <input key={photoInputKey} id="qualification-photo" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} />
          </label>
          <p className="wizard-help">Up to three photos, 20 MB each. Photos are resized before sending. Avoid including people, documents, or private details.</p>
          {values.photoName && <p className="wizard-file-state">Selected photos: {values.photoName}</p>}
          {selection('experience', 'Have you worked with a designer or builder before?', ['Yes', 'No', 'Not sure'])}
          {selection('referralSource', 'How did you hear about Miller Remodeling?', referralOptions)}
        </fieldset>}

        {step === 4 && <fieldset className="wizard-contact-fields">
          <legend tabIndex={-1}>How can we reach you?</legend>
          <p id="qualification-contact-hint" className="wizard-contact-hint">Choose one way to reach you: email or phone.</p>
          <div className="wizard-field">
            <label htmlFor="qualification-name">Name</label>
            <input id="qualification-name" autoComplete="name" maxLength={120} value={values.name} onChange={(event) => update('name', event.currentTarget.value)} onBlur={() => touchContact('name')} aria-invalid={contactTouched.name && Boolean(contactErrors.name)} aria-describedby={contactTouched.name && contactErrors.name ? 'qualification-name-error' : undefined} />
            {contactTouched.name && contactErrors.name && <span id="qualification-name-error" className="wizard-field-error" aria-live="polite">{contactErrors.name}</span>}
          </div>
          <div className="wizard-field">
            <label htmlFor="qualification-email">Email</label>
            <input id="qualification-email" type="email" inputMode="email" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="name@example.com" value={values.email} onChange={(event) => update('email', event.currentTarget.value)} onBlur={() => touchContact('email')} aria-invalid={(contactTouched.email && Boolean(contactErrors.email)) || showContactChoiceError} aria-describedby={`qualification-contact-hint${contactTouched.email && contactErrors.email ? ' qualification-email-error' : ''}${showContactChoiceError ? ' qualification-contact-error' : ''}`} />
            {contactTouched.email && contactErrors.email && <span id="qualification-email-error" className="wizard-field-error" aria-live="polite">{contactErrors.email}</span>}
          </div>
          <div className="wizard-field">
            <label htmlFor="qualification-phone">Phone</label>
            <input id="qualification-phone" type="tel" inputMode="tel" autoComplete="off" placeholder="(208) 555-0123" value={values.phone} onChange={(event) => update('phone', formatPhone(event.currentTarget.value))} onBlur={() => touchContact('phone')} aria-invalid={(contactTouched.phone && Boolean(contactErrors.phone)) || showContactChoiceError} aria-describedby={`qualification-contact-hint${contactTouched.phone && contactErrors.phone ? ' qualification-phone-error' : ''}${showContactChoiceError ? ' qualification-contact-error' : ''}`} />
            {contactTouched.phone && contactErrors.phone && <span id="qualification-phone-error" className="wizard-field-error" aria-live="polite">{contactErrors.phone}</span>}
          </div>
          {showContactChoiceError && <p id="qualification-contact-error" className="wizard-field-error" aria-live="polite">{contactChoiceError}</p>}
          {values.email.trim() && <label className="followup-choice"><input type="checkbox" checked={followupConsent} onChange={event=>setFollowupConsent(event.currentTarget.checked)}/><span>Send me up to three planning follow-ups by email over fourteen days. I can unsubscribe at any time.</span></label>}

        </fieldset>}

        {step === 5 && <div className="wizard-outcomes">
          <h3 tabIndex={-1}>{outcome ? 'Thank you. Your project inquiry is received.' : 'Review your project'}</h3>
          {selectedBand && <div className="wizard-result"><h4>A planning range for your {values.projectType.toLowerCase()}</h4><p><strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(selectedBand.min)}–{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(selectedBand.max)}</strong></p><p>{selectedBand.scope}</p><p>This is a planning range, not a quote. Scope, site conditions, and selections affect the final proposal.</p></div>}
          {!outcome && <><dl>{nonSensitiveKeys.map((key) => <div key={key}><dt>{key.replace(/([A-Z])/g, ' $1')}</dt><dd>{values[key]}</dd></div>)}<dt>Project description</dt><dd>{values.description}</dd><dt>Contact</dt><dd>{values.name} · {values.email || values.phone}</dd><dt>Photos</dt><dd>{photos.length} selected</dd></dl>
            <p>Erik will review your project details and follow up about the next step.</p>
            <SecurityCheck />
            <button type="button" className="button" disabled={sending} onClick={submitProject}>{sending ? 'Sending your project…' : attempt.current ? 'Retry project inquiry' : 'Send my project'}</button>
          </>}
          {outcome && <div className="wizard-result" role="status" aria-live="polite"><p>Erik will review the details and follow up.</p><p>Your reference: <strong>{outcome}</strong></p><button type="button" className="button button-secondary" onClick={async () => { try { await navigator.clipboard.writeText(outcome); setCopied(true); } catch { setCopied(false); } }}>{copied ? 'Reference copied' : 'Copy project reference'}</button>
            <div className="wizard-booking"><h4>A time to talk</h4><p>You can choose a conversation time on Erik’s calendar. Include your project reference when booking so he can find your inquiry.</p>
              {!bookingLoaded ? <button type="button" className="button button-secondary" onClick={() => setBookingLoaded(true)}>Load the appointment schedule</button>
                : <iframe title="Erik’s Google Calendar appointment schedule" src={bookingUrl} width="100%" height="600" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />}
              <a className="wizard-booking-link" href={bookingUrl} target="_blank" rel="noreferrer">Open the schedule in a new tab</a>
            </div>
          </div>}
        </div>}

        {errors.length > 0 && <div className="wizard-errors" role="alert" aria-live="assertive">
          <strong>Please check:</strong>
          <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>}

        <div className="wizard-actions">
          {step > 0 && !attempt.current && !outcome && <button type="button" className="button button-secondary" onClick={() => { setStep((current) => Math.max(0, current - 1)); setErrors([]); setOutcome(''); }}>Back</button>}
          {step < steps.length - 1 && <button type="submit" className="button">Continue</button>}
          <button type="button" className="wizard-clear" disabled={sending} onClick={clearProgress}>{attempt.current && !outcome ? 'Start a new inquiry' : 'Start over'}</button>
        </div>
      </form>
      <p className="wizard-storage-note">Your choices stay in this browser until you start over. Contact details, descriptions, and photos are sent only when you submit; they are never saved in browser storage.</p>
      <CostGuideForm />
    </section>
  );
}
