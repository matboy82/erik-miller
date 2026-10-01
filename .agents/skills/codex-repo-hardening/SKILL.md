---
name: codex-repo-hardening
description: Repair repository Codex instructions, skills, and review rules using actual technology, infrastructure, CI, and test constraints.
---

# Codex Repo Hardening

Codify repository facts without widening authorization.

1. Read `AGENTS.md`, `.agents/sdd-project.md` when present, README, manifests, relevant source/tests, and CI. Discover commands, ownership, generated boundaries, credentials requirements, and available tools.
2. Compare control documents to those facts. Read [technology-conventions.md](references/technology-conventions.md) and [infrastructure-codification.md](references/infrastructure-codification.md) for relevant stack/CI detail.
3. Apply [writing-for-agents](../writing-for-agents/SKILL.md) to instructions and [writing-plain-language](../writing-plain-language/SKILL.md) to human guidance.
4. Update `AGENTS.md`, `.agents/skills/<name>/SKILL.md`, and applicable `.agents/rules/`. Explicitly link rules from root instructions; do not assume rule autoloading. Use native name/description frontmatter, not Claude tools/model fields.
5. For SDD adoption, read the [profile](../_shared/sdd-project-profile.md), [workflow](../_shared/sdd-workflow-contract.md), [artifacts](../_shared/sdd-artifact-contracts.md), [identity](../_shared/sdd-artifact-identity.md), and [adapters](../_shared/sdd-tool-adapters.md). Use the [Codex profile template](../../../docs/templates/codex-sdd-project.md) for overrides; retain shared gates.
6. Keep roles single-purpose. Independent review needs a fresh-session handoff with approved artifacts and diff, without implementer reasoning. Do not create automatic launchers or claim same-session checking is independent.
7. Update the index/usage guide and validate names, references, and commands.

Return changed files, detected facts, corrected assumptions, actual verification, and remaining gaps. Never invent tools, commands, approvals, or review verdicts.
