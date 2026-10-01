---
name: sdd-qa-plan
description: Create a QA plan and traceability matrix from approved stories and persist story or QA-plan approval during SDD handoffs.
---

# SDLC QA Plan Skill

Use only after stories are approved.

## Approval status handoff

Read and apply [the shared workflow contract](../_shared/sdd-workflow-contract.md) and [project-profile rules](../_shared/sdd-project-profile.md). Resolve the active profile before choosing inputs, outputs, or verification conventions.

Read and apply [the shared SDD approval rules](../_shared/sdd-approval-status.md). Persist the approved story set before QA planning and give the new QA plan an explicit draft status.

Read and apply [the shared human-reviewability rules](../_shared/sdd-human-reviewability.md) when drafting, revising, or presenting the QA plan for approval.

Read and apply [the shared artifact contracts](../_shared/sdd-artifact-contracts.md) for the QA plan's metadata, minimum decision content, and resolved output path.

Inputs:

- The approved story set resolved from the active profile and artifact contract.
- Optional approved epic.
- Optional domain glossary and relevant accepted ADRs when they exist.

Output:

- The QA-plan path resolved from the active profile and artifact contract.

Procedure:

1. Read the approved stories and acceptance criteria.
2. Read and apply [the shared TDD practices](../_shared/tdd-practices.md).
3. When a domain glossary or accepted ADR exists, use its terminology and constraints. Continue normally when neither exists.
4. When authoritative test or quality context requires an external system, resolve only the needed capability through [the shared tool-adapter contract](../_shared/sdd-tool-adapters.md).
5. When an approved story or draft brief proposes a quality bar, apply [the Gauntlet Loop bar criteria](../gauntlet-loop/SKILL.md). Pin the reference and define the comparison protocol, environment, inputs, evidence, threshold, `Required` or `Target` classification, and what makes the result unverifiable. Continue normally when no quality bar applies.
6. Build a risk-based plan covering only the unit, integration, workflow/E2E, data, environment, and CI expectations that apply to the approved behaviors and material risks.
7. For each important behavior, name the observable outcome and proposed existing test seam. Flag a design question instead of inventing a new public interface solely for testing.
8. Describe the smallest set of test scenarios that proves the acceptance criteria and material failure modes. Use a compact AC-to-test traceability matrix; reference each acceptance criterion instead of copying its text.
9. Call out gaps and ambiguous requirements.
10. Apply the human-reviewability edit before presenting the QA plan.

Required gate:
`STOP: Human approves test seams, any quality-bar protocol and classification, unit, integration, E2E, test data, and CI expectations.`
