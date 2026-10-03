import { useEffect, useMemo, useState, type ChangeEvent, type SyntheticEvent } from 'react';

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
const steps = ['Project', 'Location', 'Timing and budget', 'Project details', 'Contact', 'Review examples'];
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
  const [outcome, setOutcome] = useState<'qualified-example' | 'alternate-example' | ''>('');
  const [bookingLoaded, setBookingLoaded] = useState(false);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const progress = useMemo(() => `${Math.round(((step + 1) / steps.length) * 100)}%`, [step]);

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
    if (step === 1 && !values.location) return ['Choose a location example to continue.'];
    if (step === 2 && (!values.timeline || !values.budget)) return ['Choose a timing and budget example to continue.'];
    if (step === 3) {
      const issues: string[] = [];
      if (!values.description.trim()) issues.push('Add a short sample project description.');
      if (!values.experience || !values.referralSource) issues.push('Complete both example questions to continue.');
      return issues;
    }
    if (step === 4) {
      const issues: string[] = [];
      if (!values.name.trim()) issues.push('Add a sample name to continue.');
      if (Boolean(values.email.trim()) === Boolean(values.phone.trim())) issues.push('Enter exactly one sample email address or phone number.');
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) issues.push('Enter a valid sample email address.');
      return issues;
    }
    return [];
  }

  function advance(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
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
      <span>{label} <span className="wizard-pending">Draft example</span></span>
      <select id={`qualification-${key}`} value={values[key]} onChange={(event) => update(key, event.currentTarget.value)}>
        <option value="">Choose an example</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );

  return (
    <section className="qualification" aria-labelledby="qualification-title">
      <div className="qualification-banner" role="note">
        <strong>Draft demo only</strong>
        <span>Use sample details. Nothing is submitted, uploaded, or sent to Miller Remodeling. Final questions and fit rules await Erik’s review.</span>
      </div>

      <div className="qualification-heading">
        <p className="eyebrow">Project-fit preview</p>
        <h2 id="qualification-title">A sample project conversation</h2>
        <p>Step through illustrative questions and preview example next steps. The examples do not define Miller Remodeling’s service area, budget rules, or project-fit policy.</p>
      </div>

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

      <form className="wizard-card" onSubmit={advance} noValidate>
        {step === 0 && <fieldset>
          <legend>What kind of project would you like to explore?</legend>
          {selection('projectType', 'Project type', projectTypes)}
          <p className="wizard-help">Draft choices based on the approved site outline. Erik will confirm the final list.</p>
        </fieldset>}

        {step === 1 && <fieldset>
          <legend>Where is the property?</legend>
          {selection('location', 'Project location', locations)}
          <p className="wizard-help">These are illustrative location choices, not confirmation of current service coverage.</p>
        </fieldset>}

        {step === 2 && <fieldset>
          <legend>What timing and budget details are useful to discuss?</legend>
          {selection('timeline', 'Timing', timelineOptions)}
          {selection('budget', 'Budget', budgetOptions)}
          <p className="wizard-help">No numeric thresholds are shown because Erik has not supplied the approved bands.</p>
        </fieldset>}

        {step === 3 && <fieldset>
          <legend>Tell us a little more</legend>
          <label className="wizard-field" htmlFor="qualification-description">
            <span>Project description <span className="wizard-pending">Draft example</span></span>
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

        {step === 4 && <fieldset>
          <legend>How could Erik follow up in this example?</legend>
          <label className="wizard-field" htmlFor="qualification-name"><span>Name <span className="wizard-pending">Use a sample</span></span><input id="qualification-name" autoComplete="off" value={values.name} onChange={(event) => update('name', event.currentTarget.value)} /></label>
          <label className="wizard-field" htmlFor="qualification-email"><span>Email example</span><input id="qualification-email" type="email" autoComplete="off" value={values.email} onChange={(event) => update('email', event.currentTarget.value)} /></label>
          <p className="wizard-or">Or</p>
          <label className="wizard-field" htmlFor="qualification-phone"><span>Phone example</span><input id="qualification-phone" type="tel" autoComplete="off" value={values.phone} onChange={(event) => update('phone', event.currentTarget.value)} /></label>
          <p className="wizard-help">Do not enter real contact details. This demonstration has no intake connection.</p>
        </fieldset>}

        {step === 5 && <div className="wizard-outcomes">
          <h3>Preview example next steps</h3>
          <p>These buttons show sample content only. No scoring is running and neither outcome represents Erik’s policy.</p>
          <div className="wizard-actions wizard-outcome-actions">
            <button type="button" className="button" onClick={() => { setOutcome('qualified-example'); setBookingLoaded(false); }}>Preview a qualified-path example</button>
            <button type="button" className="button button-secondary" onClick={() => { setOutcome('alternate-example'); setBookingLoaded(false); }}>Preview an alternate-path example</button>
          </div>
          {outcome && <div className="wizard-result" role="status" aria-live="polite">
            <strong>{outcome === 'qualified-example' ? 'Illustrative qualified-path state' : 'Illustrative alternate-path state'}</strong>
            <p>{outcome === 'qualified-example'
              ? 'A future approved flow could explain the design process and provide the owner-managed booking page. Final wording and eligibility rules are pending Erik’s review.'
              : 'A future approved flow could offer a respectful alternative next step. Erik’s approved wording and options are pending.'}</p>
            <p className="wizard-result-note">Preview only. No lead was created, no score was calculated, and no appointment was booked.</p>
            {outcome === 'qualified-example' && <div className="wizard-booking">
              <h4>Owner-managed appointment schedule</h4>
              <p>This illustrative path links to Erik’s Google Calendar appointment schedule. Its settings and JobTread association have not been verified here. Do not select a time unless you intend to make a real booking.</p>
              {!bookingLoaded
                ? <button type="button" className="button button-secondary" onClick={() => setBookingLoaded(true)}>Load the appointment schedule</button>
                : <iframe title="Erik’s Google Calendar appointment schedule" src={appointmentScheduleUrl} width="100%" height="600" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />}
              <a className="wizard-booking-link" href={appointmentScheduleUrl} target="_blank" rel="noreferrer">Open the schedule in a new tab</a>
              <p className="wizard-help">Phone or in-person meeting mode must be confirmed in Erik’s schedule settings. Google Meet is not part of this booking direction.</p>
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
          <button type="button" className="wizard-clear" onClick={clearProgress}>Clear this demo</button>
        </div>
      </form>
      <p className="wizard-storage-note">This demo saves only the selected project, location, timing, budget, experience, referral-source, and step choices in this browser. Contact details, description, and photo selection are never saved.</p>
    </section>
  );
}
