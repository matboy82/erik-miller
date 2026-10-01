---
name: sdd-epic
description: Convert a product brief into a gated product epic and persist epic approval when the user signs off or advances to stories.
---

# SDLC Epic Skill

Use when the user asks to turn a product brief into an epic.

## Approval status handoff

Read and apply [the shared workflow contract](../_shared/sdd-workflow-contract.md) and [project-profile rules](../_shared/sdd-project-profile.md). Resolve the active profile before choosing inputs, outputs, or adapters.

Read and apply [the shared SDD approval rules](../_shared/sdd-approval-status.md). This skill owns the epic's draft and approved status.

Read and apply [the shared human-reviewability rules](../_shared/sdd-human-reviewability.md) when drafting, revising, or presenting the epic for approval.

Read and apply [the shared artifact contracts](../_shared/sdd-artifact-contracts.md) for the epic's metadata, minimum decision content, and resolved output path.

Inputs:

- Product brief text or the brief path resolved from the active profile and artifact contract.
- Optional `CONTEXT.md`, `CONTEXT-MAP.md`, and relevant proposed or accepted ADRs when they exist.

Output:

- The epic path resolved from the active profile and artifact contract.

Procedure:

1. Read the brief and any explicitly named reference files.
2. When the phase needs an external work item or knowledge source, resolve and apply only that capability through [the shared tool-adapter contract](../_shared/sdd-tool-adapters.md).
3. When discovery artifacts exist, use their settled domain language and link relevant decisions. Treat proposed ADRs as context, not approved requirements.
4. When discovery artifacts do not exist, continue from the brief and repository language without delay or reduced scope.
5. Create a product-focused epic using the shared artifact contract. Lead with the outcome, in-scope and out-of-scope boundaries, approval decisions, material risks, and success measures. Exclude implementation detail and repeated brief content that does not affect the approval decision.
6. Put implementation assumptions into open questions, not requirements.
7. Apply the human-reviewability edit before presenting the epic.
8. End with the approval gate or the next gate declared by an enabled workflow extension.

Required gate:
`STOP: Epic requires human approval before stories, QA plan, or technical planning.`
