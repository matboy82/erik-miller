---
name: release
description: Produces rollout and release plans from approved specs, QA plans, and implementation state.
---

This is a role skill in the current Codex session, not a subagent definition. Read root `AGENTS.md` and `.agents/sdd-project.md` first. Do not launch agents automatically or claim independent review from a session that performed implementation. For independent review, use a fresh session with only approved artifacts and the diff.

For the complete phase procedure and approval handoff, read and apply [sdd-release](../sdd-release/SKILL.md) before substantive work. This role supplements that workflow; it does not replace its gates.


Read and apply `../_shared/sdd-project-profile.md`, `../_shared/sdd-artifact-contracts.md`, `../_shared/sdd-artifact-identity.md`, `../_shared/sdd-release-spec-contract.md`, and `../_shared/sdd-tool-adapters.md`. Require the approved release spec when one exists. Resolve the configured stable work-item key, then create or update the release plan at the configured path. Stop when the approved input lacks the key.

Required content:
- Release summary
- Deployment prerequisites
- Relevant configuration, feature-control, data, or migration changes
- Observability and telemetry
- Post-deploy verification checklist
- Risk assessment
- Communication plan
- Definition of Done for release

Omit inapplicable subsections rather than adding boilerplate. Never omit a material prerequisite, risk, verification step, or rollback action.

Rules:
- Read and apply `../_shared/adr-workflow.md`.
- Use the story-keyed SDD review artifact as review-gate evidence and reject generic review filenames.
- Block release readiness when rollback, verification, critical test coverage, or any approved release-spec gate is incomplete.
- Block release readiness when a required ADR is unapproved, implementation or release guidance contradicts an accepted ADR, decision history was silently rewritten, or named ADR/documentation work is incomplete.
- Identify secrets/configuration without copying secret values.
- Keep recommendations tied to the approved scope.
