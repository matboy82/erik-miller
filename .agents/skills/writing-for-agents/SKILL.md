---
name: writing-for-agents
description: Design and edit instructions that AI agents consume, including skills, agents, AGENTS.md, rules, prompts, and referenced workflow documents. Use to make agent behavior predictable, scoped, maintainable, and economical without weakening safety or completion criteria.
---

# Writing for Agents

Write instructions that produce a repeatable process while leaving room for task-specific judgment.

When editing a skill, also read [skill-mechanics.md](references/skill-mechanics.md).

## Audience boundary

- Use this skill for agent control documents and agent-facing procedure.
- Use `$writing-plain-language` for prose meant primarily for people.
- For mixed-audience documents, apply both: keep the explanation plain, and keep commands, paths, artifact names, status values, gates, and completion criteria exact.

## Context pointers

A context pointer names material outside the current file and states when to read it.

- Start with the trigger or condition.
- Name each genuinely different branch once.
- Point directly to the required file.
- Inline material needed on every run; move branch-specific detail to a direct reference.
- Treat a required reference behind a vague pointer as a reliability defect.

## Information hierarchy

Place information at the highest useful level:

1. **Procedure step:** an action required on this run.
2. **In-file rule:** guidance needed across most branches.
3. **Referenced detail:** formats, variants, examples, or policies needed only on some branches.

Keep references one level from the main document. Avoid chains where one reference points to another required reference.

## Steps and completion

- Put actions in execution order.
- Give each major phase a checkable completion condition.
- Make the final condition exhaustive enough to prevent premature completion.
- State what evidence proves completion.
- Separate a hard safety stop from a normal approval gate.
- Make optional inputs explicitly optional and define the fallback when absent.

## Single sources of truth

- Keep each rule in one authoritative place and point to it elsewhere.
- Read commands, layouts, and configuration from the environment when they are cheap to discover.
- Document conventions, reasons, ownership, and constraints that the environment cannot explain.
- Remove stale copies instead of reconciling several competing versions.

## Strong instruction language

- Prefer a positive target behavior: `Run targeted tests and report exact results.`
- Use prohibitions for real guardrails, paired with the safe alternative.
- Replace vague words such as `carefully` or `properly` with a checkable action or result.
- Use stable leading terms consistently when they compress a larger discipline, such as `approval gate`, `blast radius`, `test seam`, or `tight signal`.

## Review checklist

Before finishing, confirm:

- The description says what the document does and when it applies.
- Required inputs, outputs, authority, and side effects are clear.
- Optional artifacts have an explicit fallback.
- Every reference is directly reachable and named at the point of use.
- The process has checkable completion criteria.
- The same rule does not appear in competing locations.
- Human-facing prose is plain without weakening exact agent instructions.
- Indexes and companion documents are updated when the workflow changed.
