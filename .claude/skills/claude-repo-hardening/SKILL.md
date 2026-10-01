---
name: claude-repo-hardening
description: Set up or repair a repository's Claude Code CLAUDE.md, agents, skills, and rules from actual project technology, infrastructure, CI, and testing constraints; includes adversarial review setup.
---

# Claude Repo Hardening Skill

Use when asked to set up, fix, audit, or standardize a repo's Claude Code context, skills, agents, rules, or review workflow. The goal is to move assumptions out of memory and into files Claude reads.

## Inputs

- Target repository path.
- Optional report, incident, or workflow critique to codify.
- Optional desired workflow phases, agents, or slash commands.
- Optional work-item provider, artifact paths, tool adapters, or SDD extension phases.

## Required discovery

1. Read root instructions: `CLAUDE.md`, `AGENTS.md`, `.claude/**`, `README*`, and any repo-specific agent docs.
2. Identify technology from manifests and config, not from user memory:
   - JavaScript/TypeScript: `package.json`, lockfiles, `tsconfig*`, `vite`, `next`, `angular.json`, `nest-cli.json`, `nx.json`.
   - .NET: `*.sln`, `*.csproj`, `global.json`, `Directory.Build.*`, `NuGet.config`.
   - CI/infrastructure: `.github/workflows/**`, Azure/GitLab pipeline files, Dockerfiles, compose files, Terraform, Helm, Kubernetes, scripts, Makefiles.
3. Identify real commands: build, lint, test, coverage, integration, E2E, format, migration, codegen, and local dev.
4. Identify infrastructure constraints:
   - Which services exist in CI.
   - Whether Docker/Testcontainers/browsers/databases are available.
   - Required credentials, env vars, feature flags, external-tool adapters, and local-only steps.
   - Which repository owns which service, API, worker, package, or deployment path.
5. Inspect current tests and nearby implementation patterns before writing rules.

Read [technology-conventions.md](references/technology-conventions.md) when target stack guidance is needed. Read [infrastructure-codification.md](references/infrastructure-codification.md) when writing `CLAUDE.md` or CI/test constraints.

## Hardening procedure

1. Create a repo fact ledger:
   - Repo identity and ownership.
   - Detected stack and package manager.
   - Source, test, generated, migration, and infrastructure directories.
   - Commands that actually exist.
   - CI capabilities and prohibited assumptions.
   - External capability and adapter preflight needs.
2. Compare existing Claude artifacts to the ledger.
3. Apply [Writing for Agents](../writing-for-agents/SKILL.md) to agent control documents. Apply [Writing Plain Language](../writing-plain-language/SKILL.md) to human-facing documentation; apply both to mixed-audience guidance.
4. Fix or create:
   - `CLAUDE.md` with repo identity, stack, commands, infra constraints, test strategy, ownership boundaries, and approval gates.
   - `.claude/rules/*.md` files for stack-specific coding, testing, database, UI, API, security, and infrastructure rules.
   - `.claude/agents/*.md` files with single-purpose roles and technology-neutral defaults unless the target repo is single-stack.
   - `.claude/skills/*/SKILL.md` files for repeatable workflows.
   - `AGENTS.md` index entries for every new or renamed agent and skill.
5. When the repository adopts this SDD toolkit, read the shared project-profile, workflow, artifact, identity, and tool-adapter contracts. Create `.claude/sdd-project.md` from the template only when the defaults do not fit. Configure differences rather than copying provider or stack logic into core phase skills.
6. Bind required external capabilities to available local skills, MCP servers, apps, CLIs, APIs, or a named manual handoff. Add connectivity preflight rules only to phases that actually need those capabilities.
7. Declare any team-specific SDD phase with one insertion point, explicit inputs and outputs, completion evidence, and its human gate. Do not bypass a core gate.
8. Add or update an `adversarial-reviewer` agent when the repo handles multi-tenancy, auth, data isolation, financial/HR data, soft deletes, migrations, external effects, or any recurring defect class.
9. Remove stale assumptions:
   - Wrong repo names or paths.
   - Commands that do not exist.
   - Testcontainers or database requirements not available in CI.
   - Framework-specific rules copied into a different stack.
   - Agent claims of independence when the same session performed implementation and review.

## Required `CLAUDE.md` sections

- Repository identity and ownership.
- Stack and package manager.
- Important directories.
- Build, lint, test, coverage, integration, and E2E commands.
- Test strategy and CI constraints.
- Infrastructure and environment constraints.
- Database/migration rules when applicable.
- API/UI contract rules when applicable.
- External capability and adapter preflight requirements.
- Approval gates and forbidden actions.
- Known repo boundaries: what this repo owns and what belongs elsewhere.

## Adversarial review setup

If absent, create `.claude/agents/adversarial-reviewer.md` using the local agent style. It must:

- Review only; never edit.
- Receive spec and diff only, not the implementer's reasoning.
- Build a failure model before inspecting implementation.
- Prioritize tenant isolation, soft-delete leaks, auth bypasses, unused parameters, `NULL` paths, contract drift, CI mismatch, and tests that bless the same bug they should catch.
- Return blocker findings first with exploit or failure scenarios.

## Output

Return:

- Files created or updated.
- Detected repo facts codified.
- Assumptions removed or corrected.
- Commands verified or marked unavailable.
- Remaining gaps requiring human input.
- Recommended next manual action.

When SDD portability is in scope, also report whether the target uses defaults or a project profile, the toolkit version, configured adapters and fallbacks, and declared extension phases.
