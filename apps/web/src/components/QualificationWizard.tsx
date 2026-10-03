import { useEffect, useMemo, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { emailError, phoneError, formatPhone } from '../lib/contact-input';

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
const appointmentScheduleUrl = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3yGOu537xocx0E6JCgrbNeC3bf_jSF8CuCn9fS41FLe8nhR9QZR_EH5suk7HGBTPbr1NZbxS_8?gv=true';
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
  const [outcome, setOutcome] = useState<'qualified-example' | 'alternate-example' | ''>('');
  const [bookingLoaded, setBookingLoaded] = useState(false);
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
          setStep(parsed.step);
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
      if (!values.description.trim()) issues.push('Add a short sample project description.');
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
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file && !allowedPhotoTypes.includes(file.type)) {
      setValues((current) => ({ ...current, photoName: '' }));
      setErrors(['Choose a JPEG, PNG, or WebP sample image. No image is uploaded.']);
      setPhotoInputKey((current) => current + 1);
      return;
    }
    update('photoName', file ? file.name : '');
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
      <p className="demo-note">Use sample details. Nothing is submitted or uploaded.</p>


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
            <textarea id="qualification-description" rows={5} aria-invalid={errors.length > 0 && step === 3 && !values.description.trim()} value={values.description} onChange={(event) => update('description', event.currentTarget.value)} placeholder="Sample: We are exploring a kitchen update and would like to understand the design process." />
          </label>
          <label className="wizard-field" htmlFor="qualification-photo">
            <span>Optional project photo <span className="wizard-pending">Local only</span></span>
            <input key={photoInputKey} id="qualification-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} />
          </label>
          <p className="wizard-help">The selected file stays in this browser tab and is never uploaded or saved. Use a sample file only; avoid private photos.</p>
          {values.photoName && <p className="wizard-file-state">Selected sample file: {values.photoName}</p>}
          {selection('experience', 'Have you worked with a designer or builder before?', ['Yes', 'No', 'Not sure'])}
          {selection('referralSource', 'How did you hear about Miller Remodeling?', referralOptions)}
        </fieldset>}

        {step === 4 && <fieldset className="wizard-contact-fields">
          <legend tabIndex={-1}>How can we reach you?</legend>
          <p id="qualification-contact-hint" className="wizard-contact-hint">Choose one way to reach you: email or phone.</p>
          <div className="wizard-field">
            <label htmlFor="qualification-name">Name <span className="wizard-pending">Use a sample</span></label>
            <input id="qualification-name" autoComplete="off" value={values.name} onChange={(event) => update('name', event.currentTarget.value)} onBlur={() => touchContact('name')} aria-invalid={contactTouched.name && Boolean(contactErrors.name)} aria-describedby={contactTouched.name && contactErrors.name ? 'qualification-name-error' : undefined} />
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

        </fieldset>}

        {step === 5 && <div className="wizard-outcomes">
          <h3 tabIndex={-1}>Your next steps</h3>
          <p>Explore the next steps for your project.</p>
          <div className="wizard-actions wizard-outcome-actions">
            <button type="button" className="button" onClick={() => { setOutcome('qualified-example'); setBookingLoaded(false); }}>Explore a design conversation</button>
            <button type="button" className="button button-secondary" onClick={() => { setOutcome('alternate-example'); setBookingLoaded(false); }}>Explore another next step</button>
          </div>
          {outcome && <div className="wizard-result" role="status" aria-live="polite">
            <strong>{outcome === 'qualified-example' ? 'Let’s talk about the design.' : 'Let’s find the right next step.'}</strong>
            <p>{outcome === 'qualified-example'
              ? 'A design conversation is the place to explore your goals, layout, and investment. [Project-fit criteria]'
              : '[Alternative next step for projects outside our scope]'}</p>
            <p className="wizard-result-note">No inquiry has been sent.</p>
            {outcome === 'qualified-example' && <div className="wizard-booking">
              <h4>Owner-managed appointment schedule</h4>
              <p>Choose a time to talk with Erik. This opens the live appointment schedule.</p>
              {!bookingLoaded
                ? <button type="button" className="button button-secondary" onClick={() => setBookingLoaded(true)}>Load the appointment schedule</button>
                : <iframe title="Erik’s Google Calendar appointment schedule" src={appointmentScheduleUrl} width="100%" height="600" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />}
              <a className="wizard-booking-link" href={appointmentScheduleUrl} target="_blank" rel="noreferrer">Open the schedule in a new tab</a>
              <p className="wizard-help">[Appointment format]</p>
            </div>}
          </div>}
        </div>}

        {errors.length > 0 && <div className="wizard-errors" role="alert" aria-live="assertive">
          <strong>Review these sample fields:</strong>
          <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>}

        <div className="wizard-actions">
          {step > 0 && <button type="button" className="button button-secondary" onClick={() => { setStep((current) => Math.max(0, current - 1)); setErrors([]); setOutcome(''); }}>Back</button>}
          {step < steps.length - 1 && <button type="submit" className="button">Continue</button>}
          <button type="button" className="wizard-clear" onClick={clearProgress}>Start over</button>
        </div>
      </form>
      <p className="wizard-storage-note">Your choices stay in this browser. Contact details, descriptions, and photos are never saved.</p>
    </section>
  );
}
