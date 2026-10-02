# SDD Artifact Contracts

Use these minimum contracts for durable SDD artifacts. Keep them simple under the shared human-reviewability rules and include conditional sections only when relevant.

## Default paths

- Brief: `docs/product/briefs/<feature>.md`
- Epic: `docs/product/epics/<epic-slug>.md`
- Story: `docs/product/stories/<epic-slug>/<work-item-key>.md`
- QA plan: `docs/qa/test-plans/<epic-slug>.testplan.md`
- Developer spec: `docs/specs/<epic-slug>/<work-item-key>.spec.md`
- Work packages: `docs/specs/<epic-slug>/<work-item-key>.work-packages.md`
- Release spec: `docs/specs/<epic-slug>/<work-item-key>.release-spec.md`
- Review: `docs/specs/<epic-slug>/<work-item-key>.review.md`
- Stakeholder review: `docs/specs/<epic-slug>/<work-item-key>.stakeholder-review.md`
- Release plan: `docs/specs/<epic-slug>/<work-item-key>.release-plan.md`
- Diagnostic: `docs/diagnostics/<diagnostic-slug>.md`
- ADR: use the repository convention; otherwise `docs/architecture/decisions/<number>-<decision-slug>.md`

An active project profile may override these templates. Resolve tokens from approved artifacts and the configured work-item identity; never invent a missing stable ID.

## Common metadata

Every approval-gated artifact includes a title, `**Status**: Draft | Approved`, its stable work-item metadata when story-specific, and the current approval question or next gate. Open questions must follow the shared approval rules.

## Minimum decision content

- **Epic:** stakeholder problem and outcome, users, scope and non-goals, success measures, constraints, material risks/dependencies, and proposed story slices.
- **Story:** one stakeholder outcome, observable acceptance criteria, material non-functional constraints, dependencies, out of scope, and verification notes.
- **QA plan:** risks and scope, observable outcomes, proposed test seams, smallest sufficient scenario set, data/environment/CI needs, and compact acceptance-criterion traceability.
- **Developer spec:** intended change and boundaries, affected contracts and consumers, relevant design/data/security/compatibility decisions, approved test seams, verification, rollout/rollback, ADR/documentation impact, and definition of done.
- **Work package:** stable package ID, outcome, scope, dependencies, allowed and forbidden touch points, definition of done, verification, and named ADR/documentation work.
- **Release spec:** development/test exit, release-only gates and evidence owners/prerequisites, acceptance-criterion disposition map, remaining blockers, and the later release-plan/authorization handoff.
- **Review:** evaluated identity and artifact scope, verdict, blockers first, impact/compatibility assessment, acceptance-criterion and test evidence, ADR/documentation status, and quality-bar result when applicable.
- **Release plan:** readiness, shipped outcome, prerequisites, configuration/data changes, owners, observability, post-deploy verification, rollback triggers/actions, communications, and blockers.

Supporting evidence may be linked. A normative requirement or approval decision must remain in the artifact set being approved.
