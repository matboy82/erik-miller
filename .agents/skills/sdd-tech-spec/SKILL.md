---
name: sdd-tech-spec
description: Create portable developer specs, required architecture decision records, and manual work packages from approved stories and QA plans, persisting approval status during SDD handoffs.
---

# SDLC Tech Spec Skill

Use only after stories and QA plan are approved.

## Approval status handoff

Read and apply [the shared workflow contract](../_shared/sdd-workflow-contract.md) and [project-profile rules](../_shared/sdd-project-profile.md). Resolve the active profile before choosing inputs, outputs, repository discovery, or tool adapters.

Read and apply [the shared SDD approval rules](../_shared/sdd-approval-status.md). Persist approved input stories and QA plans before technical planning; create both the spec and work-package manifest with explicit draft status.

Read and apply [the shared human-reviewability rules](../_shared/sdd-human-reviewability.md) when drafting, revising, or presenting the developer spec, work-package manifest, and proposed ADRs for approval.

Read and apply [the shared artifact contracts](../_shared/sdd-artifact-contracts.md), [provider-neutral artifact identity rules](../_shared/sdd-artifact-identity.md), and the [release-spec contract](../_shared/sdd-release-spec-contract.md). Derive story-specific paths from the configured stable work-item key.

Read and apply [the shared ADR workflow](../_shared/adr-workflow.md). Evaluate its trigger on every technical-planning run.

Inputs:

- Approved story file.
- Approved QA plan.
- Relevant epic.
- Target repo or codebase context.
- Optional domain glossary.
- Existing ADRs and decision documentation relevant to the affected area.

Outputs:

- The work-item-keyed developer spec and work-package manifest at paths resolved from the active profile and artifact contract.
- A work-item-keyed release spec when acceptance or operational evidence must be deferred to rollout.
- A new `Proposed` ADR for each triggered decision not already governed by an accepted ADR.

Procedure:

1. Read the approved artifacts and resolve the configured stable work-item key. Stop and request it when absent; do not use an ordinal or title slug.
2. Read and apply [the shared TDD practices](../_shared/tdd-practices.md).
3. When the story creates or materially changes a module, interface, dependency seam, or test surface, read and apply [the shared codebase-design lens](../_shared/codebase-design.md).
4. Use domain artifacts when present. Inspect relevant ADRs, evaluate the shared ADR trigger, and record either the governing/new ADRs or `ADR not required` with a short rationale in the developer spec.
5. When the approved QA plan contains a quality bar, carry its pinned reference, classification, protocol, threshold, evidence, and unverifiable conditions into verification planning. Do not invent a new bar or let it add implementation scope.
6. Read orientation documents declared by the active profile. When none are declared, discover relevant repository instructions and architecture documentation with targeted search.
7. Use targeted codebase discovery to identify existing patterns and touch points. Inspect only manifests, source/test roots, persistence areas, generated boundaries, and infrastructure paths detected on disk or declared by the profile. Do not assume a language, framework, package manager, directory layout, or manifest name.
8. When authoritative planning context requires an external system, resolve only the needed capability through [the shared tool-adapter contract](../_shared/sdd-tool-adapters.md).
9. Write only the developer-spec sections that apply. Lead with the intended change, scope boundaries, affected contracts, and approval decisions; then cover relevant interface, data, user-interface or non-UI behavior, edge cases, approved test seams, documentation/ADR impact, verification, rollout/rollback, and definition of done. Reference approved acceptance criteria and QA scenarios instead of copying them.
10. Describe interfaces, data shapes, and dependency direction at contract level. Include a short signature or example only when prose would be less precise; do not include implementation-sized code samples or file-by-file narration.
11. Write a compact manual work-package manifest with sequential packages only. Each package names its outcome, scope, dependencies, allowed touch points, definition of done, and verification without repeating the developer spec. Include every required ADR, amendment, supersession, and current-state documentation change as a named deliverable. Use those packages as the decomposition for any later SDD gauntlet; do not create gauntlet-specific implementation slices.
12. When creating a release spec, classify every relevant check as development/test or release-only under the shared release-spec contract. Approval is part of the technical-planning gate; the artifact does not authorize rollout.
13. Apply the human-reviewability edit to the spec, manifest, release spec, and proposed ADRs before presenting the approval set. If the complete contract remains difficult to review, propose a smaller story or package split.
14. Do not include fanout, launch pads, background agent instructions, or parallel orchestration.

Required gate:
`STOP: Human approves the developer spec, work-package manifest, any release spec, and every named Proposed ADR before implementation.`
