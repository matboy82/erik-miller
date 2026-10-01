---
name: sdd-stories
description: Convert an approved epic and human-assigned work-item keys into small, testable story artifacts, and persist epic or story approval during SDD handoffs.
---

# SDLC Stories Skill

Use only after the epic is approved.

## Approval status handoff

Read and apply [the shared workflow contract](../_shared/sdd-workflow-contract.md) and [project-profile rules](../_shared/sdd-project-profile.md). Resolve the active profile before choosing inputs, outputs, identity, or adapters.

Read and apply [the shared SDD approval rules](../_shared/sdd-approval-status.md). Persist an implicitly approved input epic before story work and give each new story an explicit draft status.

Read and apply [the shared human-reviewability rules](../_shared/sdd-human-reviewability.md) when drafting, revising, or presenting stories for approval.

Read and apply [the shared artifact contracts](../_shared/sdd-artifact-contracts.md) and [provider-neutral artifact identity rules](../_shared/sdd-artifact-identity.md). Stable work-item keys must be human-assigned before story files are written.

Inputs:

- The approved epic resolved from the active profile.
- One human-assigned stable work-item key for each story.
- Optional domain glossary and relevant accepted ADRs when they exist.

Outputs:

- One work-item-keyed story file per slice at the path resolved from the active profile and artifact contract.

Procedure:

1. Read the approved epic.
2. When a domain glossary or accepted ADR exists, use its terminology and constraints. Continue normally when neither exists.
3. Slice the MVP into small, testable stories.
4. Resolve any configured work-item read capability through [the shared tool-adapter contract](../_shared/sdd-tool-adapters.md), then match every slice to its assigned stable key. Stop and request a missing key; do not create ordinal filenames or invent identifiers.
5. Include the configured canonical work-item metadata, one stakeholder outcome, observable acceptance criteria, material dependencies and non-functional constraints, explicit out-of-scope notes, and the minimum verification notes needed for QA planning.
6. Do not repeat epic background, prescribe implementation, or add acceptance criteria that do not change observable behavior or a material constraint.
7. Preserve sequencing without creating implementation tasks.
8. Apply the human-reviewability edit to every story before presenting the story set.

Required gate:
`STOP: Human approves story boundaries, dependencies, acceptance criteria, and non-functional requirements.`
