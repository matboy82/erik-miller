---
name: sdd-implement
description: Implement an approved SDD story and selected work packages using the target repository's detected technology, tools, and verification conventions, then return evidence against the approved contract.
---

# SDD Implementation Skill

Implement only approved scope and leave auditable evidence. Never describe same-session evaluation as independent review.

## Resolve the contract

Read and apply:

- [the shared workflow contract](../_shared/sdd-workflow-contract.md) and [project-profile rules](../_shared/sdd-project-profile.md) to resolve active phases, repository discovery, verification, and adapters;
- [the shared SDD approval rules](../_shared/sdd-approval-status.md) before accepting or persisting approval;
- [the shared human-reviewability rules](../_shared/sdd-human-reviewability.md) before accepting the implementation contract or writing persistent remediation/gate evidence;
- [the shared artifact contracts](../_shared/sdd-artifact-contracts.md) for every approved or persistent artifact;
- [the shared ADR workflow](../_shared/adr-workflow.md) for every named or newly triggered decision;
- [the shared TDD practices](../_shared/tdd-practices.md) during implementation and evidence evaluation;
- [the shared codebase-design lens](../_shared/codebase-design.md) only when approved scope changes a module, interface, dependency seam, or test surface;
- [the shared tool-adapter contract](../_shared/sdd-tool-adapters.md) only when an external capability is required.

## Required inputs

- Approved story and acceptance criteria.
- Approved QA plan.
- Approved developer spec and work-package manifest.
- Explicit package scope: named package IDs or an explicit request for the complete manifest.
- Current worktree and target-repository instructions.
- Any required artifacts from enabled workflow extensions.

Optional discovery artifacts and quality bars enrich the contract only when the approved artifacts name them. A direct instruction approves only the exact artifact and package scope identified by the active workflow.

## Procedure

1. Before product-code edits, read and execute [the contract and implementation cycle](references/implementation-cycle.md).
2. Work through selected packages sequentially. Do not use fanout or automatic parallel agents.
3. After the implementation diff exists, read and execute [the evidence gate](references/evidence-gate.md).
4. Fix in-scope defects and repeat affected evidence checks until the gate passes or a genuine blocker requires human action.

## Completion

Return `PASS — evidence-complete within evaluated scope` only when the evidence-gate conditions pass. Otherwise return `NOT READY — evidence incomplete or defects remain`; do not use a conditional pass.

Write a persistent evaluation artifact only when requested. Recommend `/sdd-review` for the independent review gate and `adversarial-reviewer` for Medium/High-risk or recurring defect classes.
