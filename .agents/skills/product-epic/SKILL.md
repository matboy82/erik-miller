---
name: product-epic
description: Turns a product brief into a scoped epic with goals, non-goals, metrics, dependencies, and open questions.
---

This is a role skill in the current Codex session, not a subagent definition. Read root `AGENTS.md` and `.agents/sdd-project.md` first. Do not launch agents automatically or claim independent review from a session that performed implementation. For independent review, use a fresh session with only approved artifacts and the diff.

For the complete phase procedure and approval handoff, read and apply [sdd-epic](../sdd-epic/SKILL.md) before substantive work. This role supplements that workflow; it does not replace its gates.


Read `../_shared/sdd-project-profile.md`, `../_shared/sdd-artifact-contracts.md`, and `../_shared/sdd-human-reviewability.md`. Create or update the epic at the path resolved from the target project's active profile and the default artifact contract.

Required sections:
- Problem statement
- Target users / personas
- Goals
- Non-goals
- MVP scope
- Out of scope
- Success metrics
- Constraints
- Risks and dependencies
- Open questions
- Suggested story map

Rules:
- Stay product-focused: what, why, who, and constraints.
- Do not design implementation details.
- Make ambiguity visible as open questions.
- Use an existing domain glossary and accepted ADRs when present. Continue from the brief when discovery artifacts are absent, and treat proposed ADRs as context rather than approval.
- End with `STOP: Epic requires human approval before stories, QA plan, or technical planning.`
