# Implementation Evidence Gate

Read this reference after the implementation diff exists. Re-read approved outcomes and evidence from disk; do not grade from the implementation summary or pass counts alone.

## Prove the outcome

Read the approved release spec when present. Map criteria to development/test or release-only exactly as it classifies them. Use `Deferred to release` only for a named gate in an Approved release spec; missing implementation, local tests, required quality-bar evidence, or manual checks are not deferrable merely because rollout is later.

- Map every acceptance criterion and selected-package definition of done to implementation and evidence. Mark development/test criteria `Proven`, `Partial`, `Missing`, or `Blocked`; mark only approved release-spec gates `Deferred to release` and name their release evidence.
- Verify stakeholder role, workflow, benefit, errors, and explicit out-of-scope boundaries—not only internal mechanics.
- Exercise the closest practical public boundary for stakeholder-critical behavior.
- Inspect known consumers and backward compatibility for every changed contract.

## Audit test effectiveness

- Map tests to acceptance criteria, QA scenarios, and material risks.
- Require assertions on observable outcomes rather than implementation trivia or values supplied entirely by mocks.
- Check applicable success, boundary, validation, authorization, isolation, persistence, failure, retry, timeout, concurrency, and idempotency behavior.
- Treat coverage as supporting evidence only.
- For each stakeholder-critical or High-risk behavior, run a safe sensitivity check:
  1. Record exact pre-mutation content and diff.
  2. Apply one small temporary production-code mutation that violates the behavior, or an equivalent negative control when mutation is unsafe.
  3. Run the narrowest owning test and require failure for the expected behavioral reason.
  4. Restore the exact content with a focused edit; never use `git reset`, `git checkout`, or `git stash`.
  5. Re-run the test and confirm no temporary mutation remains.
- Mark test effectiveness `Unproven` when a required sensitivity check cannot run safely or does not fail as expected.

## Evaluate quality bars

When the approved QA plan or spec defines a quality bar, compare its pinned reference under the approved protocol and return `Bar met`, `Bar not met`, or `Unverifiable` with evidence. A missed `Required` threshold blocks. Report a missed `Target` separately; it cannot add scope or start another pass without human direction.

## Audit code and blast radius

- Review the complete diff and surrounding code for correctness, simplicity, naming, cohesion, duplication, dependency direction, errors, cleanup, transactions, concurrency, security, observability, and performance.
- Confirm changed contracts, validation, data/schema, configuration, dependency wiring, generated contracts, and shared utilities remain compatible or have explicit approval and tests.
- Search for affected callers and consumers rather than assuming the diff is isolated.
- Check for secrets, debug code, focused/skipped tests, stale TODOs, unsafe defaults, dead code, and unapproved generated files.
- Compare with the baseline so user-owned changes are not modified or claimed.
- Confirm implementation, spec, accepted ADRs, current-state documentation, and operational guidance agree.

## Run risk-based verification

Resolve commands from the active profile and target repository. Run package commands first, then broaden by blast radius:

- Always run targeted tests, `git diff --check`, a build when compiled/runtime wiring changed, and available non-mutating static analysis.
- For Medium risk, run the relevant suite, coverage when behavior is broad, and the repository build.
- For High risk, run the broadest relevant unit/coverage suite, build, and required contract/integration checks.
- Run integration or E2E tests only with approved prerequisites and local or disposable dependencies.
- Record every exact command, result, skipped test, and material warning. Mark unavailable required checks `Not run`; static reasoning is not runtime evidence.

## Verdict

Return `PASS — evidence-complete within evaluated scope` only when:

- every selected package definition of done and development/test criterion is proven; any `Deferred to release` criterion is explicitly named in an Approved release spec and remains a release blocker;
- required tests pass at the approved levels and demonstrate sensitivity for critical behavior;
- required build, static analysis, coverage, contract, and integration checks pass;
- required quality bars are met;
- affected contracts and known consumers are reviewed and compatible;
- required ADR and documentation work is complete and consistent;
- no unresolved defect, material ambiguity, scope drift, or Medium/High residual risk remains;
- no temporary mutation or accidental edit remains.

Otherwise return `NOT READY — evidence incomplete or defects remain`. Distinguish package completion from full-story completion.

## Final report

Lead with verdict and scope, then provide decision-relevant evidence only. State development/test completion separately from story acceptance and release readiness:

1. Proven stakeholder outcome.
2. Compact AC/DoD traceability with implementation, test, sensitivity, and status.
3. Changed files, separated from pre-existing changes.
4. Test-quality and verification results with exact commands.
5. Impact, compatibility, data, security, and operational assessment.
6. ADR, documentation, and quality-bar assessment when applicable.
7. Residual risks, same-session evaluation limitation, and smallest next action.

Reference approved artifacts and the working ledger instead of repeating their prose. Never hide uncertainty.
