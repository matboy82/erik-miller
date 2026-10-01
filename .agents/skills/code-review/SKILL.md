---
name: code-review
description: Performs spec-first review against story, QA plan, developer spec, and current diff.
---

This is a role skill in the current Codex session, not a subagent definition. Read root `AGENTS.md` and `.agents/sdd-project.md` first. Do not launch agents automatically or claim independent review from a session that performed implementation. For independent review, use a fresh session with only approved artifacts and the diff.

For the complete phase procedure and approval handoff, read and apply [sdd-review](../sdd-review/SKILL.md) before substantive work. This role supplements that workflow; it does not replace its gates.


Review only. Do not edit files unless the user explicitly asks for a fix.

Read and apply `../_shared/sdd-project-profile.md`, `../_shared/sdd-artifact-contracts.md`, and `../_shared/sdd-artifact-identity.md`. Return findings for the caller to record in the configured work-item-keyed review artifact when persistence is required; never target a generic review filename.

Inputs:
- Approved story with its configured stable work-item key
- Approved QA plan
- Approved developer spec and work package
- Current diff or changed files

Review checklist:
- Acceptance criteria implemented exactly.
- Tests exist at the levels required by the QA plan.
- Tests follow `../_shared/tdd-practices.md` and exercise approved or established public seams.
- Apply `../_shared/adr-workflow.md`: re-evaluate its trigger, inspect relevant accepted ADRs or the approved `ADR not required` rationale, and verify decision/documentation conformance.
- Optional domain terminology is followed when domain artifacts exist.
- Apply `../_shared/codebase-design.md` only when the diff changes a module, interface, dependency seam, or test surface.
- When approved artifacts define a quality bar, return its `Bar met`, `Bar not met`, or `Unverifiable` result separately. A missed `Target` is non-blocking; a missed `Required` threshold blocks only when explicit in approved artifacts.
- No unapproved scope expansion.
- Repo guardrails followed.
- Error handling, edge cases, security, observability, and performance considered.
- Impact map is complete enough for the diff size:
  - Changed public contracts: routes, DTOs, validation behavior, response shape, status codes, headers, Swagger/OpenAPI docs, entities, migrations, env vars, module providers, shared services, guards, filters, middleware, decorators, or shared utilities.
  - Known callers and consumers found with targeted grep/glob, not full-repo summarization.
  - Existing tests that exercise affected consumers, not only tests for newly changed code.
  - Blast radius classified as Low, Medium, or High.
- Cross-impact risks:
  - Does this change affect behavior outside the approved story or developer spec?
  - Are all known callers/consumers still compatible?
  - If a contract changed intentionally, is that change explicit in the approved artifacts?
  - Are additional verification commands justified by the blast radius?

Risk-based review depth:
- Low: private implementation changes only; targeted tests are usually enough.
- Medium: service, DTO, controller, or config behavior; review affected callers and run targeted tests plus build or the relevant suite.
- High: API contract, validation, auth, error envelope, correlation ID, database schema, migrations, shared providers, runtime config, or cross-module behavior; require broader verification or explicitly document why it is not needed.

Block if:
- The implementation changes behavior outside the approved story/spec without explicit approval.
- A public API, DTO, validation rule, error shape, database schema, env var, or shared provider changes without matching tests or documented compatibility rationale.
- Known consumers are affected but not reviewed.
- The ADR workflow identifies a missing or unapproved decision record, a material contradiction, incomplete named documentation work, or a silent history rewrite.

Output:
- Persistent artifact target when applicable: the story-keyed SDD review artifact defined by the shared naming rules.
- Configured work-item identity and evaluated artifact scope.
- Verdict: Approve, Approve with nits, or Block.
- Blockers with file/line references where possible.
- Non-blocking improvements.
- Impact assessment with blast radius, affected contracts, affected consumers, compatibility risk, and recommended verification.
- AC-to-implementation coverage.
- Test coverage assessment.
- ADR and documentation assessment.
- Suggested next manual action.
