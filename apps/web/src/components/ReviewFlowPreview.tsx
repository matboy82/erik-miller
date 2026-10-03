import { useState } from 'react';

type ReviewState = 'held' | 'approved' | 'edited' | 'withdrawn';
const stateDescriptions: Record<ReviewState, string> = {
  held: 'A real review would remain private until Erik checks its source, wording, and usage permission.',
  approved: 'Erik’s exact-item approval would allow an eligible review record to enter the site build.',
  edited: 'Any edit would return the item to a held state until Erik approves the changed wording.',
  withdrawn: 'A withdrawn item would be removed from public output while required provenance stays recorded.',
};

export default function ReviewFlowPreview() {
  const [state, setState] = useState<ReviewState>('held');
  const [paused, setPaused] = useState(false);

  return (
    <section className="review-flow" id="review-flow-demo" aria-labelledby="review-flow-title">
      <div className="review-flow-heading">
        <p className="eyebrow">Draft workflow demo</p>
        <h2 id="review-flow-title">Review request and approval flow</h2>
        <p>This preview demonstrates workflow states only. It contains no customer record, review, or sent message.</p>
      </div>
      <div className="review-flow-grid">
        <div className="review-flow-panel">
          <h3>Completion request</h3>
          <p>Job completion → eligibility check → one optional, neutral review request. No sentiment filtering or incentives.</p>
          <div className="workflow-status" role="status" aria-live="polite">
            <strong>{paused ? 'Demo paused' : 'No workflow action taken'}</strong>
            <span>{paused ? 'A real workflow would stop until an owner resumes it.' : 'This demo does not connect to JobTread or send messages.'}</span>
          </div>
          <button type="button" className="button button-secondary" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
            {paused ? 'Resume demo display' : 'Preview pause control'}
          </button>
          <div className="review-copy-example">
            <strong>Illustrative Draft request copy</strong>
            <p>“Thank you for working with Miller Remodeling. If you choose, you can share an honest review. Feedback is optional and does not affect your service.”</p>
            <span>Sample wording only. Erik must approve exact timing and copy before any real request.</span>
          </div>
        </div>

        <div className="review-flow-panel">
          <h3>Website review approval</h3>
          <label htmlFor="review-state">Preview an approval state</label>
          <select id="review-state" value={state} onChange={(event) => setState(event.currentTarget.value as ReviewState)}>
            <option value="held">Held for review</option>
            <option value="approved">Approved for publication</option>
            <option value="edited">Edited, approval renewed</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <div className="workflow-status" role="status" aria-live="polite">
            <strong>{state.replace('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())} · example state</strong>
            <span>{stateDescriptions[state]}</span>
          </div>
          <div className="review-empty-state" role="note">
            <strong>No testimonial is shown</strong>
            <span>Real review wording, reviewer attribution, source, and usage permission are pending. This page does not invent any of them.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
