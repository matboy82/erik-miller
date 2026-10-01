# Shared TDD Practices

Apply these practices when planning, implementing, or reviewing tests. The approved story, QA plan, developer spec, and target repository conventions remain authoritative.

## Test through an agreed seam

A test seam is the public boundary through which behavior is exercised and observed.

- Prefer the highest practical existing seam that proves the acceptance criterion: route, component, command, message handler, module interface, or other caller-visible boundary.
- Record proposed seams in the QA plan and developer spec so human approval settles them before implementation.
- During implementation, use the approved seam without asking again.
- If no seam was approved, prefer an existing public boundary. Ask only when introducing a new seam would materially change the design or scope.
- Do not create an abstraction solely to make mocking convenient.

## Work in vertical cycles

For each behavior:

1. Write or identify one test that fails for the missing behavior.
2. Confirm it fails for the expected reason.
3. Implement the smallest complete behavior that makes it pass.
4. Re-run the narrow test.
5. Inspect the diff and continue with the next behavior.

Use characterization tests before behavior-preserving refactors. Record why a meaningful red test was unavailable when the existing code already satisfies the behavior or the environment cannot reproduce it safely.

## Test observable behavior

Strong tests:

- Exercise a public interface.
- Assert an outcome a user, caller, or external system can observe.
- Use expected values from the approved requirement, a worked example, a protocol, or another independent source.
- Survive internal refactoring.
- Cover relevant success, boundary, validation, authorization, persistence, failure, retry, timeout, concurrency, and idempotency behavior.

Reject tests that:

- Assert private methods or incidental call order.
- Recompute the expected value with the same logic as the implementation.
- Mock the behavior being proved.
- Pass without reaching the intended branch.
- Depend on uncontrolled time, randomness, order, network, or shared state.

## Use test doubles at real boundaries

- Prefer real in-process collaborators and local substitutes when they are fast and deterministic.
- Use fakes or mocks for true external boundaries, time, randomness, or unavailable infrastructure.
- Keep test-double behavior specific and visible; avoid conditional mini-implementations inside mocks.
- Verify outcomes first. Verify collaborator calls only when the interaction itself is the contract.

## Prove sensitivity

For stakeholder-critical or high-risk behavior, use the safe sensitivity procedure in `$sdd-implement`: a temporary mutation or equivalent negative control must make the owning test fail for the expected reason, then be fully restored.
