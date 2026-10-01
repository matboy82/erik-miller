# Architecture Decision Record Workflow

Apply this workflow during technical planning, implementation, review, and release. ADRs are optional only when no trigger applies; evaluating the trigger is mandatory.

## Trigger

Require an ADR for a durable decision involving any of these:

- authorization, authentication, tenant isolation, or another security model;
- a public or cross-service contract;
- persistence, schema ownership, or data-lifecycle strategy;
- a shared platform dependency or infrastructure boundary;
- rollout, compatibility, or deprecation policy;
- a hard-to-reverse or surprising choice among plausible alternatives.

Routine local implementation choices that follow an established pattern do not need an ADR. Record `ADR not required` with a short rationale in the developer spec so the decision is explicit and reviewable.

## Planning

1. Search the repository's ADRs and current documentation before proposing a decision.
2. Reuse an accepted ADR when it already governs the choice; link it from the story and developer spec.
3. For a new triggered decision, create a `Proposed` ADR in the repository's established ADR directory and format. If neither exists, use `docs/architecture/decisions/<next-four-digit-number>-<decision-slug>.md`.
4. Include status, date, concise context, the decision, only credible alternatives, material consequences, security and compatibility impact, and links to the governing story and developer spec. Do not repeat the spec or include implementation detail that is not part of the durable decision.
5. Name every required ADR and documentation change in the developer spec and a work package.
6. End the technical-planning gate by requesting approval of the spec, work-package manifest, and every named `Proposed` ADR together.

## Approval and implementation

- A direct instruction to implement an approved spec/package accepts only the `Proposed` ADRs named by that approved package. Change those ADRs to `Accepted` and record the approval date before product-code changes.
- Do not accept an unrelated ADR or infer approval from discussion, review comments, or a conditional statement.
- Implement according to accepted ADRs and keep specs, ADR links, current-state documentation, contracts, and operational guidance aligned.
- If implementation reveals a new triggered decision or requires changing an accepted decision, stop and return to the technical-planning gate.
- Never silently rewrite approved or historical decisions. Add a dated amendment or create a superseding ADR, preserve the prior text, and link the old and new records in both directions.

## Review and release

Block review or release readiness when any of these is true:

- a triggered decision has neither an ADR nor an approved `ADR not required` rationale;
- a required ADR is still `Proposed`, rejected, or otherwise unapproved;
- code, specs, current-state documentation, or operational guidance materially contradict an accepted ADR;
- a changed decision silently rewrites history instead of using an amendment or superseding ADR;
- required ADR or documentation work named by an approved package is incomplete.

Report the ADRs inspected, trigger decisions, status, conformance evidence, and any documentation or supersession findings.
