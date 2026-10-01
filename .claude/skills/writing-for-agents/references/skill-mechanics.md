# Skill Mechanics

## Frontmatter and triggering

- Keep the folder name and frontmatter `name` identical and in lowercase hyphen-case.
- Make the description the trigger: say what the skill does and list the distinct situations that should invoke it.
- Keep invocation guidance out of a generic `When to use` body section; the body is available only after the skill is selected.
- Use manual invocation for workflows that require an explicit human choice, such as a long discovery interview.
- Use automatic discovery only when the agent must apply the discipline without relying on the human to remember it.

## Body design

- Start with the outcome, authority, and important boundary.
- Put required inputs before the procedure.
- Keep the main path compact and move conditional formats or variants into `references/`.
- Link every required reference directly from `SKILL.md` and state when to read it.
- End with the artifact, evidence, gate, or other checkable completion condition.

## Composition

- Prefer shared reference files when several workflows need the same rules.
- Avoid a one-line wrapper that merely names another skill when the workflow depends on that skill loading reliably.
- Do not copy shared rules into every consumer. Point each consumer to the source of truth and define a fallback when the reference is optional.
- Keep orchestrators thin: route and gate; let focused skills own detailed procedure.

## Repository integration

- Update `AGENTS.md` when a skill is added, removed, or renamed.
- Update the human how-to guide when the expected workflow changes.
- Keep agent-facing material in `.claude/`; keep onboarding and operational explanation under `docs/`.
- Validate names, relative links, and frontmatter after editing.
