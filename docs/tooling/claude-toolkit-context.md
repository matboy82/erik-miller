# Claude Project Context

This repository is the canonical, portable distribution of Claude Code agents, workflow skills, and rules for spec-driven development. It is not a product application repo.

## Repository Purpose

- `.claude/agents/` contains project-level Claude agents.
- `.claude/skills/` contains slash-command workflow skills.
- `.claude/rules/` contains reusable coding and review guardrails.
- `.claude/skills/_shared/` contains the stable workflow, artifact, profile, identity, adapter, approval, ADR, testing, and reviewability contracts.
- `docs/templates/` contains the optional project-profile and provider-adapter templates for non-default trackers, paths, stacks, tools, or phases.
- `VERSION`, `toolkit.manifest`, and `scripts/` define toolkit validation and downstream synchronization.
- `AGENTS.md` is the human-facing index for available agents and skills.
- `docs/how-to/team-ai-tooling.md` is the shared human-and-agent usage guide.

## Technology And Infrastructure

- There is no product runtime, package manager manifest, database, Docker compose file, or CI pipeline in this repo.
- Toolkit maintenance scripts use Python 3 and the standard library only. Product repositories do not need Python to execute the Markdown skills.
- Do not infer NestJS, React, Angular, .NET, database, or Testcontainers constraints for this repo from copied rules. Those constraints belong in the target product repository's own `CLAUDE.md` and `.claude/rules/`.
- Validate changes with file inspection and targeted text search unless a future manifest adds a real build or test command.

## MCP And Tooling

- `.claude/settings.local.json` currently enables Jira for this maintainer's environment; Jira is the zero-configuration identity default, not a toolkit dependency.
- Core workflows describe external needs through `.claude/skills/_shared/sdd-tool-adapters.md`. Provider-specific mechanics belong in a target repository's `.claude/sdd-project.md` or adapter skill.

## Editing Rules

- Keep skills compact and procedural.
- Put reusable detail in `references/` files when it would otherwise bloat a skill.
- Keep canonical SDD entrypoints provider-neutral and technology-neutral. Do not hardcode a tracker, hosting provider, package manager, manifest, source root, test runner, or external app outside defaults and adapter/profile documentation.
- Extend the workflow through `.claude/sdd-project.md`, a phase-owned reference, or a new focused skill. Do not weaken shared gates or edit every phase for a local integration.
- Apply `.claude/skills/writing-for-agents/SKILL.md` to agent control documents.
- Apply `.claude/skills/writing-plain-language/SKILL.md` to human-facing prose. For mixed-audience documents, keep prose plain while preserving exact commands, paths, gates, and status values.
- Keep agents single-purpose and manually invoked.
- Do not add fanout launchers or automatic multi-agent orchestration unless explicitly approved.
- When updating the workflow, update `AGENTS.md` in the same change.
- Increment `VERSION` for a released toolkit change: patch for compatible fixes, minor for backward-compatible capabilities, major for breaking contracts.

## Optional Discovery Artifacts

- `/grill-with-docs` may create a draft product brief, `CONTEXT.md` or `CONTEXT-MAP.md`, and proposed ADRs in a target product repository.
- Every `sdd-*` workflow must continue from its normal approved inputs when those discovery artifacts do not exist.
- Use domain language and accepted ADR constraints when present. Never treat a proposed ADR as implementation approval.

## Architecture Decisions

- Apply `.claude/skills/_shared/adr-workflow.md` during technical planning, implementation, review, and release.
- Discovery is optional, but ADR trigger evaluation during technical planning is mandatory.
- Require an ADR for durable security, contract, persistence, platform dependency, rollout/compatibility, or hard-to-reverse architectural decisions. Record `ADR not required` with rationale for routine local choices.
- Approve the spec, work packages, and named proposed ADRs at the same human gate. Preserve changed decision history through dated amendments or superseding ADRs.

## Optional Quality Bars

- `/gauntlet-loop` creates manual builder and critic prompts around a pinned quality reference; it does not execute them.
- A quality bar is `Required` only when an approved artifact makes its threshold part of the contract. A `Target` is reported separately and cannot block or add scope.
- Run one builder and one critic at a time. A human chooses whether to start another round.
- The approved story, QA plan, developer spec, and work package remain authoritative.

## Verification

For this repo, use:

- `python3 scripts/validate_toolkit.py`
- `python3 scripts/sync_downstream.py <target-repository>` for a read-only downstream drift check.
- `git diff --check`

Run `python3 scripts/sync_downstream.py <target-repository> --apply` only when the user intends to update that repository. It backs up changed managed files and preserves local additions.
