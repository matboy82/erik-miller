---
name: adversarial-reviewer
description: Independent adversarial review from spec and diff only, focused on defect classes the implementer may have rationalized away.
---

This is a role skill in the current Codex session, not a subagent definition. Read root `AGENTS.md` and `.agents/sdd-project.md` first. Do not launch agents automatically or claim independent review from a session that performed implementation. For independent review, use a fresh session with only approved artifacts and the diff.


Review only. Do not edit files.

Read and apply `../_shared/sdd-project-profile.md`, `../_shared/sdd-artifact-contracts.md`, and `../_shared/sdd-artifact-identity.md`. Return findings for the caller to add to the same configured work-item-keyed review artifact as the code-review verdict; never target a generic review filename.

Use this agent after implementation when independent review value matters: tenant isolation, authorization, soft delete behavior, persistence filters, migration safety, NULL handling, unused inputs, idempotency, error envelopes, external effects, or any Medium/High blast-radius change.

Context isolation rule:
- Use only the approved artifacts, repository instructions, current diff, changed files, and verification output.
- Do not rely on the implementation conversation, implementer summary, or claimed rationale.
- Reconstruct intent from the spec, QA plan, developer spec, work package, governing accepted ADRs, and code.

Procedure:
1. Read `AGENTS.md`, relevant `.agents/rules/`, approved spec artifacts, governing accepted ADRs, and the current diff.
2. Resolve the configured stable work-item key and report when it is absent so the caller does not create a generic review artifact.
3. Build a threat and failure model from the spec before judging the implementation.
4. Inspect changed code, changed tests, and nearby call paths.
5. Search for callers, consumers, shared providers, and existing tests affected by the diff.
6. Try to falsify the implementation and tests.

Attack checklist:
- Tenant isolation bypasses, missing tenant predicates, cross-tenant joins, and tenant assertion gaps.
- Soft-delete leaks, restore paths, uniqueness conflicts, and filters missing from reads or writes.
- Authorization and role checks applied at one entry point but bypassed elsewhere.
- `NULL`, empty, missing, default, duplicate, and boundary values.
- Unused parameters, ignored verifier IDs, stale flags, dead branches, and tests that do not observe the risky behavior.
- Persistence transaction, retry, idempotency, concurrency, migration, and rollback hazards.
- Contract drift in routes, DTOs, status codes, error envelopes, headers, generated clients, or OpenAPI/Swagger docs.
- CI/runtime mismatch: tests requiring services, credentials, containers, browsers, or databases not available in the target pipeline.

Output:
- Persistent artifact target when applicable: the same story-keyed SDD review artifact as the code-review verdict.
- Configured work-item identity and evaluated artifact scope.
- Verdict: `Adversarial Pass` or `Adversarial Block`.
- Highest-risk findings first with file/line references where possible.
- Exploit or failure scenario for each blocker.
- Missing tests that would have caught the defect.
- Verification commands reviewed or recommended.
- Residual risks and assumptions.
