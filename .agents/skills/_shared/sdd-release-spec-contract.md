# Release Specification Contract

Use a story-keyed release spec when a story has material evidence or approvals that can only be completed after development and testing. Keep it separate from the release plan: it classifies proof and gates; it does not plan or authorize a deployment.

## Identity and approval

- Path: `docs/specs/<epic-slug>/<work-item-key>.release-spec.md`, using the configured local story key.
- Metadata: title, `**Status**: Draft | Approved`, `**Work item**`, source story/spec/QA links, and approval question or record.
- Approve the release spec with the governing technical contract. For existing approved contracts, create a Draft release spec without changing the prior approval; only an explicit approval of the new artifact enables deferrals.

## Required content

- **Development/test exit**: implemented behavior, required local and simulated tests, quality bars, and evidence that must pass before code review can approve the implementation.
- **Release-only gates**: each deferred acceptance check, exact evidence required, owner, prerequisites, and whether the check mutates an external system.
- **Disposition map**: map affected story acceptance criteria and package outcomes to development/test or release-only evidence.
- **Boundary**: state what remains incomplete until release gates pass; name any owner input, provider access, configuration, or authorization still required.
- **Handoff**: require an approved `$sdd-release` plan after review; deployment and external actions still need separate authorization.

## Deferral rules

- Only an **Approved** release spec can classify an acceptance check as `Deferred to release` during implementation or code review.
- Deferral moves only the named live, account-specific, owner-approval, or production check. It does not waive implementation, local contract tests, deterministic simulations, required accessibility/security checks, or an approved quality bar that can be run locally.
- If code or a local test seam is missing, record the criterion as incomplete. Do not classify missing implementation as a release gate.
- An implementation or code-review verdict may pass its development/test scope with named criteria `Deferred to release`; this is not story acceptance or release readiness.
- `$sdd-release` must report `Not Ready` while any required release-only gate or review verdict remains incomplete. It must not perform deployment or external actions without explicit authorization.

