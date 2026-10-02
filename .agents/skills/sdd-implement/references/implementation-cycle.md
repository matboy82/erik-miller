# Contract and Implementation Cycle

Read this reference before editing product code.

## Establish the contract

1. Read the target repository's instructions, active project profile, approved story, QA plan, developer spec, complete work-package manifest, approved release spec when present, and required extension artifacts.
2. Read orientation documents and inspect manifests, source, tests, ownership boundaries, and infrastructure declared by the profile or discovered on disk. Do not assume a language, framework, package manager, directory layout, or test runner.
3. Read and apply the shared TDD practices. Apply the shared codebase-design lens only when approved scope creates or materially changes a module, interface, dependency seam, or test surface.
4. Read every ADR and `ADR not required` rationale named by the approved package. Accept only its named proposed ADRs under the shared ADR workflow before product-code changes.
5. Resolve external capabilities through the shared tool-adapter contract only when the package requires them. Missing optional adapters do not block local work; a missing authoritative required input does.
6. Capture `git status`, existing diffs, and untracked files as the baseline. Preserve and separately report user-owned changes.
7. Build a working ledger containing:
   - stakeholder outcome and in-scope acceptance criteria;
   - selected package definitions of done;
   - required test scenarios, levels, and approved seams;
   - allowed, expected, and forbidden touch points;
   - verification commands resolved from the profile and repository;
   - contract, data, security, operational, rollout, and rollback constraints;
   - required ADR and current-state documentation work;
   - approved quality-bar protocol and classification, when present;
   - the release-spec development/test boundary and named release-only gates, when present.
8. Build a targeted impact map of affected public contracts, callers, consumers, shared dependencies, persistence, configuration, and tests. Classify blast radius under repository review rules.

Stop before implementation when approval or selected scope is ambiguous, artifacts conflict materially, a required decision is unresolved, the active profile cannot be resolved, or safe implementation requires an unapproved change.

## Implement each package

Execute selected packages one at a time in manifest order.

1. Re-read the package outcome, scope, dependencies, touch points, definition of done, and verification.
2. Establish a test at the approved public seam before relying on implementation:
   - prefer a failing test for new or corrected behavior;
   - prefer characterization tests for behavior-preserving refactors;
   - record why a meaningful pre-change failure is unavailable.
3. Implement the smallest complete behavior that satisfies the approved contract and target-repository conventions.
4. Do not add a dependency, broaden a contract, weaken validation, alter an error shape, or change a shared dependency unless approved artifacts authorize it.
5. Apply named ADR and documentation work. Stop and return to technical planning when implementation reveals a new ADR trigger or changes an accepted decision.
6. Run the package's targeted tests through commands detected from the repository or declared by the profile. Never weaken a valid assertion to obtain green output.
7. Inspect the package diff for scope drift, accidental edits, and changes to known consumers before continuing.

Fix in-scope defects and update tests. When the correct fix exceeds approved scope, stop and request approval instead of applying a partial workaround.
