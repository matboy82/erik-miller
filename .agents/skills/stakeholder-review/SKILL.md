---
name: stakeholder-review
description: Perform a stakeholder-focused review of a User Story implementation by checking the approved story, current code, and tests for acceptance criteria coverage, scope fit, and release readiness. Use when asked to review whether a completed or in-progress User Story satisfies stakeholder expectations, business intent, acceptance criteria, and required verification.
---

# Stakeholder Review Skill

Use this skill to review implementation work against a User Story from the perspective of the stakeholder who needs the story outcome, not only from the perspective of code quality.

Read and apply [the shared SDD approval rules](../_shared/sdd-approval-status.md). Unanswered open questions in any artifact under review block an approval verdict.

Read and apply [the shared human-reviewability rules](../_shared/sdd-human-reviewability.md) before accepting the approved story contract and when returning or persisting the stakeholder review.

Read and apply [the shared workflow contract](../_shared/sdd-workflow-contract.md), [project-profile rules](../_shared/sdd-project-profile.md), [artifact contracts](../_shared/sdd-artifact-contracts.md), and [provider-neutral artifact identity rules](../_shared/sdd-artifact-identity.md). Return the review in the conversation by default. When persistence is requested, use the configured work-item-keyed stakeholder-review path.

Review only. Do not edit product files unless the user explicitly asks for fixes. Writing the named review artifact is allowed only when the user explicitly requests persistence.

## Inputs

- User Story file or story text.
- Current diff, branch, pull request, or changed files.
- QA plan, developer spec, work package, epic, or product brief when available.
- Verification output when available.

If a required artifact is not provided, discover likely artifacts using the repository conventions in `AGENTS.md`. If multiple stories could apply, ask the user to choose before judging correctness.

## Procedure

1. Establish the review target:
   - Resolve the configured stable work-item key. If a persistent result is requested and the key is absent, stop and request it; do not create a generic review filename.
   - Identify the story title, story path, status, stakeholders, user role, goal, benefit, acceptance criteria, non-functional expectations, dependencies, and explicit out-of-scope items.
   - Read the epic, QA plan, developer spec, and work package when they exist for the same story.
   - Read orientation documents and repository roots declared by the active profile when the relevant code areas are not already known.
2. Inspect the implementation evidence:
   - Inspect `git diff --stat`, `git diff --name-only`, and targeted diffs for changed source, tests, config, migrations, generated docs, and API contracts.
   - Read changed files and nearby existing patterns before forming findings.
   - Use targeted grep/glob to find callers, consumers, DTOs, routes, providers, entities, migrations, guards, filters, middleware, decorators, shared utilities, and tests affected by the change.
3. Build a stakeholder impact map:
   - Identify the user-visible behavior delivered.
   - Identify changed public contracts: routes, DTOs, validation behavior, response shape, status codes, headers, Swagger/OpenAPI docs, entities, migrations, env vars, module providers, shared services, guards, filters, middleware, decorators, or shared utilities.
   - Identify affected consumers and compatibility risk.
   - Classify blast radius as Low, Medium, or High.
4. Trace the story:
   - Map every acceptance criterion to code evidence and test evidence.
   - Mark each criterion as `Covered`, `Partially covered`, `Not covered`, or `Unclear`.
   - Check that the implementation preserves the user role, goal, and business benefit stated in the story.
   - Flag implementation that satisfies code mechanics but misses the stakeholder outcome.
5. Review tests and verification:
   - Read and apply [the shared TDD practices](../_shared/tdd-practices.md) when judging test seams, assertions, test doubles, and sensitivity.
   - Confirm tests exist at the levels implied by the story and QA plan.
   - Check meaningful assertions for happy paths, edge cases, validation, errors, authorization, persistence, and integration behavior when relevant.
   - Prefer targeted verification for Low blast radius, targeted tests plus build or relevant suite for Medium, and broader verification or explicit rationale for High.
   - Treat missing verification output as a risk; do not invent test results.
   - When the approved QA plan or developer spec defines a quality bar, return a separate `Bar met`, `Bar not met`, or `Unverifiable` result. A missed `Target` is non-blocking; a missed `Required` threshold blocks only when explicit in approved artifacts.
6. Check scope and release readiness:
   - Identify behavior outside the approved story, QA plan, developer spec, or work package.
   - Check operational concerns when relevant: logging, telemetry, migrations, feature flags, rollback, env vars, performance, security, and backwards compatibility.
   - Separate stakeholder blockers from engineering nits.
7. Return a clear verdict.

When domain or ADR artifacts exist, check terminology and accepted constraints. Continue normally when they do not exist. Apply [the shared codebase-design lens](../_shared/codebase-design.md) only when the change materially alters a module, interface, dependency seam, or test surface.

## Blockers

Block the story when any of these are true:

- An artifact under review contains an unanswered open question.
- An acceptance criterion is not implemented or cannot be verified from code/tests.
- The implementation changes behavior outside the approved story without explicit approval.
- User-visible behavior does not satisfy the story's role, goal, or business benefit.
- A public API, DTO, validation rule, error shape, database schema, env var, or shared provider changes without matching tests or compatibility rationale.
- Known callers or consumers are affected but not reviewed.
- Required tests are missing for stakeholder-critical behavior.
- An approved `Required` quality-bar threshold is not met or cannot be verified.
- Verification failed or was not run for a Medium or High blast-radius change without a clear rationale.

## Output

Return the review in the conversation unless persistence was explicitly requested. For a persistent result, write the work-item-keyed stakeholder-review artifact resolved from the active profile.

Use this structure:

- Configured work-item identity and evaluated artifact scope.
- Verdict: `Approve`, `Approve with nits`, or `Block`.
- Stakeholder outcome: one short paragraph explaining whether the story outcome is actually delivered.
- Blockers: ordered by severity, with file/line references where possible.
- Acceptance criteria coverage: table with AC, implementation evidence, test evidence, and status.
- Test and verification assessment: commands reviewed or recommended, pass/fail/unknown status, and gaps.
- Quality-bar assessment when applicable: reference, protocol, classification, evidence, and separate result.
- Impact assessment: blast radius, affected contracts, affected consumers, compatibility risk, and operational risk.
- Scope assessment: in-scope work, out-of-scope changes, and follow-up candidates.
- Suggested next action: the smallest concrete step needed to approve, fix, or release.

Keep the review concise enough for stakeholders to act on. Put findings before summaries, and avoid praising implementation that still has unresolved acceptance, compatibility, or verification gaps.
