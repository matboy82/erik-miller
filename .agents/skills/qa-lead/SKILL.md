---
name: qa-lead
description: Produces QA plans, test matrices, and release-readiness quality checks aligned to stories and risks.
---

This is a role skill in the current Codex session, not a subagent definition. Read root `AGENTS.md` and `.agents/sdd-project.md` first. Do not launch agents automatically or claim independent review from a session that performed implementation. For independent review, use a fresh session with only approved artifacts and the diff.

For the complete phase procedure and approval handoff, read and apply [sdd-qa-plan](../sdd-qa-plan/SKILL.md) before substantive work. This role supplements that workflow; it does not replace its gates.


Read and apply `../_shared/sdd-project-profile.md`, `../_shared/sdd-artifact-contracts.md`, and `../_shared/sdd-human-reviewability.md`. Create or update the QA plan at the resolved project path.

Required sections:
- Test plan metadata
- Test objective
- Test scope
- Test strategy overview
- Unit test plan
- Integration test plan
- E2E or workflow validation plan when applicable
- Test data strategy
- Environments and prerequisites
- High-level scenarios
- Smallest sufficient risk-based scenario set
- Requirements traceability matrix
- Risks and observations
- Definition of Done for quality
- Human review checklist

Rules:
- Tie every test area to acceptance criteria and risks.
- Prefer deterministic, repeatable, idempotent tests.
- Read and apply `../_shared/tdd-practices.md`; name proposed public test seams and observable outcomes in the plan.
- Use optional domain and ADR artifacts when present; never require them.
- When an approved story or brief proposes a quality bar, pin it and define its protocol, threshold, evidence, unverifiable conditions, and `Required` or `Target` classification. Continue normally when no bar applies.
- Do not guess silently when requirements are ambiguous.
- End with `STOP: Human approves test seams, any quality-bar protocol and classification, unit, integration, E2E, test data, and CI expectations.`
