# Test deployment and credential isolation

**Status**: Accepted
**Approval recorded**: Matt, 2026-10-01 — “Approved”; with the MR-01 spec, manifest, and 0001 reconciliation.
**Date**: 2026-10-01
**Work item**: MR-01
**Governing artifacts**: [Story](../../product/stories/website-lead-qualification/mr-01.md), [developer spec](../../specs/website-lead-qualification/mr-01.spec.md), [accepted frontend stack](ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md)

## Accepted amendment: automatic deployment ? 2026-10-01

Matt explicitly instructed: ?Take the deploy flag out?. This amendment replaces the opt-in flag and flag-based recovery guidance in the original decision below. Passing `main` pushes automatically publish Pages and the health Worker; passing same-repository PRs automatically publish Pages previews. `ENABLE_TEST_DEPLOYS` is no longer read. Keep successful verification, environment `test`, credential isolation, fork exclusion, stale-main checks, noindex, and live checks. Required environment approval settings still apply.

To halt future runs after a publication failure, disable the Verify workflow in GitHub Actions, cancel queued runs, and inspect any active publication and sanitized resource outcomes. Disabling the workflow does not undo a deployment or cancel active publication. Recovery still requires a known-good revision and renewed live checks. This local amendment grants no commit, push, account change, production, or DNS authorization.

The original accepted decision is retained below for history. The story, spec, QA matrix, and setup guide now reflect this amendment.

## Context

The static site needs a persistent review URL and per-PR previews. CI must verify fork contributions without granting Cloudflare access. A test health Worker proves hosting only; the accepted frontend ADR defers actual intake hosting to WS-2.

## Decision

Use the existing GitHub Actions verification pipeline and Wrangler Direct Upload to a dedicated BIS Cloudflare Pages test project. Keep `main` as its persistent branch, use `pr-<number>` for same-repository previews, and deploy the existing test health Worker only on verified main pushes. The business domain and production resources are excluded.

Deployment is opt-in through `ENABLE_TEST_DEPLOYS`, depends on successful verification, and uses environment `test`. Cloudflare credentials appear only in deployment command steps; package installation, site compilation, and verification run without them. Fork PRs never receive these credentials or publish. Use `pull_request`, never privileged PR-target execution of contributed code. Matt confirms that same-repository contributors are trusted or configures required environment approval before enabling publication.

Preserve all three noindex boundaries on test Pages. Confirm actual HTTPS responses after publishing and retain sanitized URLs, revisions, and results. Serialize persistent deployments and prevent stale queued revisions overwriting current main. Pages and Worker are separate publications; partial success must remain visible and fail readiness.

## Alternatives

- Cloudflare Git integration: viable for site previews, but splits verification/deployment ownership from the existing combined Pages/Worker pipeline. Do not mix it with Direct Upload for this project.
- Manual upload only: useful for recovery, but does not satisfy verified automatic main and PR publication.
- Privileged fork previews: rejected because contributed code must not cross the deployment credential boundary.

## Consequences, security, and compatibility

The test account/token/project and environment settings need Matt's confirmation and separate external-action authorization. Noindex does not make the site private; no private material may be published. Least-privilege tokens exclude DNS changes. Preserve static portability and the existing health response; this decision selects no production API hosting, datastore, or JobTread integration.

Disable the deployment flag on failure. Restoring known-good test resources requires separately authorized redeployment and renewed live checks. Release readiness requires independent review and does not follow from this ADR's acceptance.

## Evidence references

Official documentation read 2026-10-01; these sources support the platform mechanics, not proof of this repository's live behavior:

- [GitHub PR events and fork secret restrictions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Cloudflare Pages Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Pages static response headers](https://developers.cloudflare.com/pages/configuration/headers/)

**Approval gate**: Complete, 2026-10-01. Acceptance grants no remote-action authority.
