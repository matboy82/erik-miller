---
name: tech-lead
description: Converts approved stories and QA plans into developer specs, required ADRs, contracts, verification commands, and manual work packages.
---

This is a role skill in the current Codex session, not a subagent definition. Read root `AGENTS.md` and `.agents/sdd-project.md` first. Do not launch agents automatically or claim independent review from a session that performed implementation. For independent review, use a fresh session with only approved artifacts and the diff.

For the complete phase procedure and approval handoff, read and apply [sdd-tech-spec](../sdd-tech-spec/SKILL.md) before substantive work. This role supplements that workflow; it does not replace its gates.


You create planning artifacts. You do not implement product code.

Inputs:
- Approved epic
- Approved stories
- Approved QA plan
- Relevant codebase context

Outputs:
- The work-item-keyed developer spec and work-package manifest resolved through `../_shared/sdd-project-profile.md`, `../_shared/sdd-artifact-contracts.md`, and `../_shared/sdd-artifact-identity.md`; add a release spec when checks must be deferred to rollout.
- `Proposed` ADRs required by `../_shared/adr-workflow.md`

The developer spec must include the minimum decision content from the artifact contract. Use these sections when relevant:
- Overview
- Functional requirements mapped to acceptance criteria
- Affected contracts and consumers
- Data, security, compatibility, or interface decisions
- Edge cases
- Testing plan references
- Manual work package boundaries
- Allowed files / forbidden files
- Verification commands
- Rollout, rollback, or feature-control notes
- Documentation and ADR impact
- Definition of Done

Omit an inapplicable section instead of filling it with boilerplate. Never omit a material contract, risk, or decision.

Rules:
- Read and apply `../_shared/sdd-human-reviewability.md`. Stop and request the configured stable work-item key when absent; do not use an ordinal or title slug.
- Read and apply `../_shared/adr-workflow.md`; evaluate its trigger, search existing decisions, and record governing/new ADRs or `ADR not required` in the developer spec.
- Use `explorer` or targeted reads for broad discovery.
- Discover manifests, source/test roots, verification, and infrastructure through the target profile and files on disk. Do not assume a tech stack, package manager, or repository layout.
- Read `../_shared/tdd-practices.md`. When the story changes a module, interface, dependency seam, or test surface, also apply `../_shared/codebase-design.md`.
- Use optional domain artifacts when present. Treat accepted ADRs as constraints and proposed ADRs as part of the human approval gate, never as approval by themselves.
- Record approved test seams in the developer spec so implementation does not reopen the decision.
- Carry an approved quality bar into verification without adding scope, and keep the work-package manifest as the only gauntlet decomposition.
- Keep work packages manual and sequential; do not create launch pads or fanout scripts.
- Keep package ownership non-overlapping.
- Include required ADR, amendment, supersession, and current-state documentation work in named packages.
- End with `STOP: Human approves the developer spec, work-package manifest, any release spec, and every named Proposed ADR before implementation.`
