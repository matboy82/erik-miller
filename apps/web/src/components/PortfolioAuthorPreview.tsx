import { useState } from 'react';

const initialDraft = {
  title: 'Draft example: A room planned around everyday routines',
  projectType: 'Kitchen',
  location: 'Pending Erik’s confirmation',
  summary: 'Illustrative copy only. Replace this section with a source-backed description of the actual project scope.',
  challenge: 'Draft prompt: What planning challenge did the homeowner want to solve?',
  result: 'Draft prompt: What changed after the work was complete? Add only verified outcomes.',
};

export default function PortfolioAuthorPreview() {
  const [draft, setDraft] = useState(initialDraft);
  const [preview, setPreview] = useState(initialDraft);
  const [message, setMessage] = useState('Edit sample fields, then preview the exact copy in this page. Nothing is saved or published.');

  function update(field: keyof typeof initialDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setMessage('Unsaved Draft changes. Preview them before any future owner approval.');
  }

  function previewDraft() {
    if (!draft.title.trim() || !draft.summary.trim()) {
      setMessage('Add a sample title and summary before previewing.');
      return;
    }
    setPreview({ ...draft });
    setMessage('Local preview updated. No repository change or publication occurred.');
  }

  function resetDraft() {
    setDraft(initialDraft);
    setPreview(initialDraft);
    setMessage('Draft example restored. Nothing was saved or published.');
  }

  return (
    <section className="portfolio-author" id="author-demo" aria-labelledby="author-demo-title">
      <div className="portfolio-author-intro">
        <p className="eyebrow">Draft authoring demo</p>
        <h2 id="author-demo-title">Shape a project story</h2>
        <p>Use sample text to preview the portfolio format on a phone. Real project facts, photos, rights, and owner approval are still required before publishing.</p>
      </div>
      <div className="portfolio-author-grid">
        <form className="portfolio-editor" onSubmit={(event) => { event.preventDefault(); previewDraft(); }}>
          <label htmlFor="author-title">Draft title</label>
          <input id="author-title" value={draft.title} onChange={(event) => update('title', event.currentTarget.value)} />
          <label htmlFor="author-type">Project type</label>
          <select id="author-type" value={draft.projectType} onChange={(event) => update('projectType', event.currentTarget.value)}>
            {['Kitchen', 'Bathroom', 'Whole home', 'Addition', 'ADU', 'Home repair'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <label htmlFor="author-location">Location</label>
          <input id="author-location" value={draft.location} onChange={(event) => update('location', event.currentTarget.value)} />
          <label htmlFor="author-summary">Project summary</label>
          <textarea id="author-summary" rows={4} value={draft.summary} onChange={(event) => update('summary', event.currentTarget.value)} />
          <label htmlFor="author-challenge">Planning challenge</label>
          <textarea id="author-challenge" rows={3} value={draft.challenge} onChange={(event) => update('challenge', event.currentTarget.value)} />
          <label htmlFor="author-result">Verified result</label>
          <textarea id="author-result" rows={3} value={draft.result} onChange={(event) => update('result', event.currentTarget.value)} />
          <div className="portfolio-media-pending" role="note">
            <strong>Project media pending</strong>
            <span>Use only real Miller project photos/video with recorded provenance and permission. No sample image is represented as project evidence.</span>
          </div>
          <div className="wizard-actions">
            <button type="submit" className="button">Update local preview</button>
            <button type="button" className="button button-secondary" onClick={resetDraft}>Reset example</button>
          </div>
          <p role="status" aria-live="polite">{message}</p>
          <button className="button portfolio-publish" type="button" disabled aria-describedby="portfolio-publish-help">Publish this project</button>
          <p id="portfolio-publish-help" className="wizard-help">Publishing stays unavailable until the approved Access and GitHub publishing service is configured. This local demo cannot approve or publish content.</p>
        </form>

        <article className="portfolio-rendered" aria-label="Rendered Draft project preview">
          <p className="draft-pill">DRAFT EXAMPLE · NOT MILLER PROJECT EVIDENCE</p>
          <p className="eyebrow">{preview.projectType} · {preview.location}</p>
          <h3>{preview.title}</h3>
          <section><h4>Project overview</h4><p>{preview.summary}</p></section>
          <section><h4>Planning challenge</h4><p>{preview.challenge}</p></section>
          <section><h4>Result</h4><p>{preview.result}</p></section>
          <p className="wizard-help">Photo, video, source, license, and Erik’s exact-content approval have not been supplied.</p>
        </article>
      </div>
    </section>
  );
}
