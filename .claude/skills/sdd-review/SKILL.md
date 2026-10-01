---
name: sdd-review
description: Perform a spec-first implementation review against approved SDD artifacts, return or persist the result under its configured work-item key, and persist explicit remediation approval before re-review.
---

# SDLC Review Skill

Use after implementation and targeted verification.

## Approval status handoff

Read and apply [the shared workflow contract](../_shared/sdd-workflow-contract.md) and [project-profile rules](../_shared/sdd-project-profile.md). Resolve the active profile before choosing review inputs, outputs, verification, or adapters.

Read and apply [the shared SDD approval rules](../_shared/sdd-approval-status.md). Before a re-review, persist approval of the exact remediation spec or work package the user approved; do not turn the review verdict itself into human approval.

Read and apply [the shared human-reviewability rules](../_shared/sdd-human-reviewability.md) before accepting the approved review contract and when returning or persisting review findings and remediation scope.

Read and apply [the shared ADR workflow](../_shared/adr-workflow.md). ADR trigger and conformance checks are required review evidence.

Read and apply [the shared artifact contracts](../_shared/sdd-artifact-contracts.md) and [provider-neutral artifact identity rules](../_shared/sdd-artifact-identity.md). Use the configured work-item-keyed review artifact for every persistent result.

Inputs:

- Approved story.
- Approved QA plan.
- Approved developer spec and work package.
- Current diff or changed files.

Output:

- The work-item-keyed SDD review artifact resolved from the active profile when persistence is requested or the review gate requires an adversarial verdict.
- Otherwise, return review findings in the conversation.

Procedure:

1. Resolve the configured stable work-item key from the approved story. If a persistent result is required and the key is absent, stop and request it; do not create a generic review filename.
2. Read target-repository instructions and the active profile. When review requires an external capability, resolve it through [the shared tool-adapter contract](../_shared/sdd-tool-adapters.md). Report unavailable required context before reviewing; use local evidence for optional capabilities.
3. Read and apply [the shared TDD practices](../_shared/tdd-practices.md) when assessing tests. Apply [the shared codebase-design lens](../_shared/codebase-design.md) only when the diff creates or materially changes a module, interface, dependency seam, or test surface.
4. Use domain artifacts when present. Audit the diff against relevant ADRs and re-evaluate the ADR trigger; absence of an ADR is a finding when the trigger applies and no approved `ADR not required` rationale exists.
5. When the approved QA plan or developer spec defines a quality bar, verify its pinned reference, protocol, threshold, evidence, and classification. Return a separate `Bar met`, `Bar not met`, or `Unverifiable` result. A missed `Target` is non-blocking; a missed `Required` threshold blocks only when explicit in the approved artifacts.
6. Inspect the current diff and changed tests.
7. Build a cost-conscious impact map before judging correctness:
   - Identify changed public contracts: routes, DTOs, validation behavior, response shape, status codes, headers, Swagger/OpenAPI docs, entities, migrations, env vars, module providers, shared services, guards, filters, middleware, decorators, or shared utilities.
   - Identify known callers and consumers using targeted grep/glob and focused file reads.
   - Identify existing tests that exercise affected consumers, not only tests for the changed code.
   - Classify blast radius as Low, Medium, or High.
8. Map each acceptance criterion to implementation and tests.
9. Identify blockers, scope drift, missing tests, ADR/documentation drift, cross-impact risks, and operational risks.
10. Choose verification expectations by blast radius:
   - Low: targeted tests are usually enough when only private implementation changed.
   - Medium: review affected callers and expect targeted tests plus build or the relevant suite.
   - High: require broader verification or an explicit rationale when API contracts, validation, auth, error envelopes, correlation IDs, database schema, migrations, shared providers, runtime config, or cross-module behavior are affected.
11. Return a clear verdict. Lead with blockers and the approval decision; reference approved requirements and evidence instead of restating them. When persistence is required, create or update the story-keyed SDD review artifact without erasing an existing code-review or adversarial-reviewer verdict.

For Medium or High blast-radius changes, or for changes involving tenant isolation, authorization, soft deletes, persistence filters, migrations, external effects, or recurring defect classes, recommend a separate `adversarial-reviewer` pass with only the approved artifacts and diff. Record its verdict in the same story-keyed SDD review artifact.

Block if:

- The implementation changes behavior outside the approved story/spec without explicit approval.
- A public API, DTO, validation rule, error shape, database schema, env var, or shared provider changes without matching tests or documented compatibility rationale.
- Known consumers are affected but not reviewed.
- The shared ADR workflow identifies a missing or unapproved decision record, a material contradiction, incomplete named documentation work, or a silent history rewrite.
- An approved `Required` quality-bar threshold is not met or cannot be verified.

Required review sections:

- Configured work-item identity and evaluated artifact scope.
- Code-review verdict.
- Adversarial-reviewer verdict and findings when that review is required or was run.
- Impact Assessment:
  - Blast radius: Low | Medium | High
  - Affected contracts
  - Affected consumers
  - Compatibility risk
  - Tests covering affected consumers
  - Recommended additional verification
- AC-to-implementation coverage.
- Test coverage assessment.
- ADR and documentation assessment: trigger result, records inspected, status, conformance, and amendment/supersession evidence.
- Quality-bar assessment when applicable: reference, protocol, classification, evidence, and separate result.
- Blockers and non-blocking improvements.

Verdicts:

- `Approve`
- `Approve with nits`
- `Block`
