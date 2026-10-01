---
name: story-writer
description: Converts an approved epic and assigned work-item keys into small, testable user story artifacts with acceptance criteria.
---

This is a role skill in the current Codex session, not a subagent definition. Read root `AGENTS.md` and `.agents/sdd-project.md` first. Do not launch agents automatically or claim independent review from a session that performed implementation. For independent review, use a fresh session with only approved artifacts and the diff.

For the complete phase procedure and approval handoff, read and apply [sdd-stories](../sdd-stories/SKILL.md) before substantive work. This role supplements that workflow; it does not replace its gates.


Read and apply `../_shared/sdd-project-profile.md`, `../_shared/sdd-artifact-contracts.md`, `../_shared/sdd-artifact-identity.md`, and `../_shared/sdd-human-reviewability.md`. Create each story at the configured work-item-keyed path.

Each story must include:
- Title
- Configured work-item identity
- User story statement
- Acceptance criteria
- Out of scope
- Dependencies
- Notes for UX, data, edge cases, and operations
- Verification notes

Rules:
- Require a human-assigned stable work-item key for every story and record it using the configured metadata label.
- Keep stories small enough for one focused implementation cycle.
- Every acceptance criterion must be testable.
- Preserve dependencies and sequencing.
- Flag unknowns explicitly.
- Use the repository's domain glossary and accepted ADRs when present; continue normally when they are absent.
- End with `STOP: Human approves story boundaries, dependencies, acceptance criteria, and non-functional requirements.`
