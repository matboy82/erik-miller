# How to Use the Team AI Tooling

This toolkit helps a person and an AI agent plan, build, review, and release software from approved written artifacts. It keeps product decisions separate from implementation and adds a human approval gate before each major phase.

## Start here

Work in the product repository where you want the change. Read that repository's `CLAUDE.md`, `AGENTS.md`, and optional `.claude/sdd-project.md` first because its commands, architecture, infrastructure, identity, artifact paths, tools, and declared workflow extensions take priority.

Then choose the path that matches your work:

| You have | Start with |
|---|---|
| A clear product brief | `/sdd-epic` |
| A rough idea that needs careful discovery | `/grill-with-docs` |
| An approved epic | `/sdd-stories` |
| Approved stories | `/sdd-qa-plan` |
| Approved stories and QA plan | `/sdd-tech-spec` |
| An approved spec and work packages | `/sdd-implement` |
| A completed implementation | `/sdd-review` |
| A hard bug or performance regression | `/diagnosing-bugs` |
| A scoped artifact needs comparison with a concrete quality reference | `/gauntlet-loop` |
| A reviewed change ready for rollout planning | `/sdd-release` |

## The standard SDD flow

```text
Optional discovery
  /grill-with-docs
        ↓
Product brief
  /sdd-epic
        ↓ human approves epic
  /sdd-stories
        ↓ human approves stories
  /sdd-qa-plan
        ↓ human approves test seams and test plan
  /sdd-tech-spec
        ↓ human approves spec and work packages
  /sdd-implement
        ↓ implementation evidence is ready
  /sdd-review
        ↓ human accepts review or approves remediation
  /sdd-release
```

Every downstream command may record the approval of the artifact immediately before it. Discussion, requested revisions, or a conditional statement do not count as approval.

The default flow remains unchanged when no project profile exists. A profile may insert a declared required or optional phase at one explicit point; it cannot bypass or weaken a core gate.

## Adopt the toolkit in another repository

The canonical toolkit is versioned independently of any product stack.

1. From this repository, run `python3 scripts/sync_downstream.py <target-repository>` to inspect missing or changed managed files without writing.
2. Run the same command with `--apply` only when you intend to update the target. Changed managed files are backed up under `.claude/toolkit-backups/`; local files not present in the canonical manifest are preserved.
3. Use the defaults when the team uses Jira-style keys and the standard `docs/...` paths.
4. When defaults do not fit, copy [the project-profile template](../templates/sdd-project.md) to `.claude/sdd-project.md` in the target repository. Configure only the fields that differ.
5. Add team-specific skills or adapters as new files. [Use the adapter-skill template](../templates/sdd-tool-adapter.md) for provider-specific integrations. Do not edit canonical phase skills for a local tracker, tech stack, repository layout, or external service.
6. Run `python3 scripts/validate_toolkit.py` in the canonical repository after toolkit changes. In each downstream repository, rerun the read-only sync check before adopting a newer version.

The profile can configure:

- work-item providers such as Jira, Azure DevOps, GitHub Issues, Linear, or a human-assigned local key;
- artifact directories and filename normalization;
- manifests, source roots, test roots, infrastructure roots, and generated-code boundaries for any stack;
- build, test, coverage, static-analysis, contract, and integration commands;
- tool capabilities for work items, knowledge, pull requests, CI, releases, and communications;
- additional workflow phases with explicit inputs, outputs, evidence, and gates.

Toolkit skills detect repository facts when a profile omits them. A profile is an override, not an installation prerequisite.

Keep provider mechanics behind capability adapters. For example, a phase asks for `work-item.read` or `pull-request.write`; the target profile chooses the local skill, connector, CLI, API, or manual handoff that supplies it. A missing optional adapter may fall back to local evidence. A missing required source blocks the phase, and external writes always require their own authorization.

## Onboard an engineer or adopting team

Run `/team-onboarding` in the target product repository with a real, approved, low-risk work item. The skill reads that repository's profile and teaches its configured identity, artifact paths, verification, tool adapters, workflow extensions, and human gates. It uses read-only orientation and shadowing before a supervised pass.

At every supervised gate, the learner must present a simple, concise artifact with all approval-critical questions answered. The onboarding lead records explicit approval; the learner does not approve their own work. The onboarding log defaults to `docs/onboarding/<log-slug>.md`, and the target profile may override that support path.

## Optional discovery with Grill With Docs

Use `/grill-with-docs` when the idea is still fuzzy, terms have different meanings across teams, or important trade-offs are unresolved.

The skill:

1. Reads the target repository and any existing domain documents.
2. Asks decision questions in rounds and gives a recommendation for each question.
3. Finds repository facts instead of asking you to look them up.
4. Builds a shared domain language in `CONTEXT.md` when useful.
5. Offers a proposed ADR only for a hard-to-reverse, surprising trade-off.
6. Creates a draft product brief after you confirm discovery is complete.

You may skip this skill. `/sdd-epic` and every later SDD phase work without a discovery session or glossary. Technical planning still evaluates whether the proposed implementation contains a durable decision that requires an ADR.

Example:

```text
/grill-with-docs Help us define how partner delivery failures should be retried and surfaced to customers.
```

## Create and approve planning artifacts

Every approval gate requires answered questions. Before approving an artifact or advancing to the next phase, resolve every item marked open or unresolved and record the answer in the artifact. If the team explicitly moves a question out of scope or into a follow-up, record that decision and why it cannot change the artifact being approved. An `Approved` artifact that still contains an unanswered question blocks downstream work until the contradiction is fixed.

Approval-ready artifacts must also be simple and concise. They lead with the outcome, scope, decisions, risks, and verification that the current gate asks you to approve. They omit repeated background, boilerplate, irrelevant sections, exhaustive test prose, and implementation detail that does not affect the decision. Concision must not remove a material requirement, contract, risk, test expectation, or ADR. If the complete contract is still hard to review, split the story, spec, or work package before approval.

### Epic

Run `/sdd-epic` with a product brief or brief path. Review the problem, target users, outcomes, scope, non-goals, risks, and open questions. Approve the epic before asking for stories.

### Stories

Run `/sdd-stories` with the approved epic and a human-assigned stable work-item key for each story. The default profile uses Jira and writes `docs/product/stories/<epic-slug>/<work-item-key>.md`, normalizing `PLAT-12345` to `plat-12345.md`. Another profile may use a different provider, metadata label, normalization rule, or path. The workflow never invents a missing key or falls back to an ordinal/title slug.

Review story size, acceptance criteria, dependencies, non-functional requirements, and what is out of scope.

### QA plan

Run `/sdd-qa-plan` with the approved stories. The plan names observable outcomes, proposed test seams, test levels, data, environments, and CI needs. Approve the test seams as part of this gate; implementation should not reopen them unless the design must change.

### Developer spec and work packages

Run `/sdd-tech-spec` with the approved stories and QA plan. The skill inspects the target codebase and writes:

- `docs/specs/<epic-slug>/<work-item-key>.spec.md`
- `docs/specs/<epic-slug>/<work-item-key>.work-packages.md`

These are default paths; an active profile may override them. The spec and work-package manifest always reuse the story's configured stable key without inventing another identity.

The tech-spec workflow also evaluates the shared ADR trigger. Durable security/auth, public or cross-service contract, persistence, shared-platform, rollout/compatibility, or hard-to-reverse architectural decisions require a proposed ADR. Routine local implementation choices instead receive an explicit `ADR not required` rationale in the developer spec.

Approve the spec, work packages, and every named proposed ADR together before implementation. Work packages stay sequential and have non-overlapping scope.

## Govern architecture decisions through every phase

ADRs are not limited to optional discovery. The same lifecycle applies from technical planning through release:

1. `/sdd-tech-spec` searches existing decisions, evaluates the trigger, and creates required ADRs as `Proposed`.
2. Human approval covers the spec, work-package manifest, and named proposed ADRs together.
3. `/sdd-implement` records those named ADRs as `Accepted` before product-code changes and stops if implementation exposes a new durable decision.
4. `/sdd-review` blocks missing or unapproved required ADRs, contradictions, incomplete documentation work, and silent decision-history rewrites.
5. `/sdd-release` requires accepted, implemented decisions and complete ADR/documentation work.

When a decision changes, add a dated amendment or a superseding ADR, preserve the old text, and link both records. Do not rewrite history to make the later choice appear original.

## Implement and prove the change

Run `/sdd-implement` with named work-package IDs, or explicitly ask for the complete approved manifest.

The implementation workflow:

- Captures the existing worktree before editing.
- Uses the approved test seams and works in small red-to-green cycles.
- Follows the target repository's established architecture and domain language.
- Applies accepted ADRs and completes the documentation/decision-record work named by the approved package.
- Runs targeted checks for each package.
- Maps acceptance criteria to code and test evidence.
- Checks whether critical tests can detect a controlled defect.
- Reports exact commands and results.

Implementation is not an independent review. Use `/sdd-review` for the review gate. Use the `adversarial-reviewer` agent for medium- or high-risk changes, especially authorization, tenant isolation, persistence, migrations, external effects, or recurring defect classes.

## Review and record the result

Run `/sdd-review` against one work-item-keyed story. When the result must be persisted—because you request it or the review gate requires an adversarial verdict—the workflow uses the configured review path. The default is:

- `docs/specs/<epic-slug>/<work-item-key>.review.md`

Under the default Jira profile, story `PLAT-12345` produces `plat-12345.review.md`. The `code-review` and required `adversarial-reviewer` verdicts belong in this same file. Do not create generic files such as `review.md` or `review-notes.md`.

`/stakeholder-review` returns its result in the conversation by default. When you ask to persist it, the default path is `docs/specs/<epic-slug>/<work-item-key>.stakeholder-review.md`.

## Draft the pull request description

Run `/pr-description` when the implementation and its verification evidence are ready. The skill inspects the complete branch or PR change set and returns Markdown you can paste into GitHub. It summarizes:

- Outcome
- Why
- How
- What changed
- How it was validated

The draft uses approved story and planning artifacts when they exist. It names checks that were not run and never treats the PR description as a review verdict or approval.

## Plan the release

Run `/sdd-release` against one reviewed work-item-keyed story. The workflow resolves the configured identity before writing. The default path is:

- `docs/specs/<epic-slug>/<work-item-key>.release-plan.md`

The default Jira profile normalizes `PLAT-12345` to `plat-12345.release-plan.md`. Another profile may use a different safe normalization and path. The workflow does not rename existing release-plan artifacts implicitly.

## Use a Gauntlet Loop for an optional quality bar

Run `/gauntlet-loop` when a concrete external reference or measurable benchmark would improve a scoped result. Good examples include a protocol conformance suite, performance baseline, accessibility reference, published document, or fixed UI capture.

The skill creates a manual packet:

1. A pinned quality bar and comparison protocol.
2. A builder prompt for one exact piece.
3. A separate review-only critic prompt.
4. The human decision required before another round.

It does not run either prompt. Run one agent at a time, and do not give the critic the builder's reasoning.

For SDD work:

- Complete the normal story, QA, spec, and work-package gates first.
- Use the approved work package as the builder scope.
- Treat the approved artifacts as the contract; the bar cannot add requirements or change architecture.
- A `Required` bar blocks only when its threshold is explicit in an approved artifact.
- A `Target` result is reported separately and does not block an otherwise conforming change.
- Run `/cost-check` before an expensive round and before each substantial additional round.

Example:

```text
/gauntlet-loop Create an SDD gauntlet packet for work package WP-03. Compare our event replay throughput with benchmark results pinned in the approved QA plan.
```

## Diagnose a bug without fixing it

Run `/diagnosing-bugs` when you need evidence before planning a fix.

The skill:

1. Builds one focused command that detects the exact symptom.
2. Reproduces and minimizes the failure.
3. Tests ranked, falsifiable hypotheses.
4. Records an evidence-backed root cause or explains why the result is inconclusive.
5. Proposes a remediation, regression-test seam, blast radius, and verification plan.
6. Writes `docs/diagnostics/<bug-slug>.md`.

It does not implement the fix. Feed the diagnostic report into the normal story, QA, spec, work-package, and implementation gates.

Example:

```text
/diagnosing-bugs Diagnose why duplicate partner events sometimes create two downstream requests. Do not fix it yet.
```

## Use skills and agents for different jobs

Use a skill for a repeatable workflow in the current session. Use a named agent when you need a focused role or isolated review context.

Examples:

- Use `/sdd-tech-spec` for the technical-planning procedure; use `tech-lead` when you want a dedicated planning agent.
- Use `/sdd-review` for the review procedure; use `code-review` or `adversarial-reviewer` when you want a separate reviewer.
- Use `explorer` for focused, read-only codebase discovery.
- Use `database`, `implementation-engineer`, or `test-engineer` only for approved work packages.

Run agents manually. Do not add automatic fanout or parallel launchers.

## Write for the right audience

Use `/writing-plain-language` for onboarding, how-to guides, README files, product documentation, UI text, notices, emails, and error messages. Keep exact commands, paths, API names, and status values unchanged.

Use `/writing-for-agents` for skills, agent definitions, `CLAUDE.md`, `AGENTS.md`, rules, prompts, and other agent control documents.

For a document read by people and agents, use both:

- Make explanations and navigation plain for people.
- Keep procedures, gates, completion criteria, paths, and commands exact for agents.

## Shared testing and design practices

The main SDD skills already apply two shared references:

- ADR workflow: mandatory trigger evaluation, proposed/accepted status gates, conformance review, and preserved decision history.
- TDD practices: public test seams, vertical red-to-green cycles, independent expected values, and test sensitivity.
- Codebase design: small coherent interfaces, useful seams, dependency direction, locality, and testability.

You do not invoke these as separate workflow steps. The SDD phases apply them at their defined gates. Target-repository conventions always take priority unless they weaken an explicit approval or safety gate.

## Rules for AI agents

When an AI agent uses this toolkit, it must:

1. Read the target repository's instructions, optional project profile, and approved input artifacts before substantive work.
2. Resolve the active workflow, configured work-item identity, artifact paths, and current phase; then state the exact artifact scope.
3. Persist an explicit approval before starting the next gated phase.
4. Keep draft, proposed, approved, review, and diagnostic statuses distinct.
5. Treat Grill With Docs artifacts as optional.
6. Evaluate the ADR trigger during technical planning; record governing/new ADRs or an explicit `ADR not required` rationale.
7. Never treat a proposed ADR as approval to implement.
8. Block implementation, review, or release when the shared ADR workflow says the decision state is incomplete or contradictory.
9. Preserve user-owned worktree changes and report its own changes separately.
10. Treat a quality bar as optional unless an approved artifact marks its threshold `Required`.
11. Run agents only when the user selects them; never create automatic fanout.
12. Report commands as passed only when they were actually run and passed.
13. Stop at the current skill's gate and name the smallest next action.
14. Use external systems through configured capabilities and adapter skills; do not hardcode provider mechanics into a core phase.
15. Discover the target technology from repository evidence; do not assume a manifest, package manager, source layout, test runner, or deployment platform.

## If you are unsure what to do next

- Check the status field in the latest artifact.
- Find the first unapproved gate in the standard flow.
- Run `/cost-check` before a large or unclear step.
- Ask for the smallest missing decision when artifact scope is ambiguous.
- Do not skip backward to implementation when a planning artifact is still draft.
