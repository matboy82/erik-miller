# Brand selection and build isolation

**Status**: Accepted
**Approval recorded**: Matt, 2026-10-01 — “approved”; with the MR-02 spec and complete manifest.
**Date**: 2026-10-01
**Work item**: MR-02
**Governing artifacts**: Approved [story](../../product/stories/website-lead-qualification/mr-02.md), [spec](../../specs/website-lead-qualification/mr-02.spec.md), and [work packages](../../specs/website-lead-qualification/mr-02.work-packages.md).

## Context

The review site compares three directions and independent copy/tagline choices. Production must contain exactly Erik's selection and no alternative assets or review code. The scaffold checks nonempty approval strings and a few token markers; these cannot establish a recorded choice or complete artifact isolation. A is only the review starting point.

This is a durable build/approval and compatibility policy. The accepted [frontend ADR](ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md), [0001](0001-bootstrap-foundation.md), and [0002](0002-test-deployment-isolation.md) continue to govern stack and test hosting.

## Accepted decision

Maintain a canonical version-1 `docs/brand/brand-lock.json` with separate visual direction, copy direction, and stable tagline selection, plus Erik's identity, approval date, and a decision-record path. One build-time owner validates it at every production entry and selects the permitted brand inputs before rendering. Unknown or incomplete approval fails; production never defaults to A.

The lock references a separate Accepted brand-choice ADR with matching structured selection/approval metadata and a link to recorded Erik sign-off. Keep that eventual choice distinct from this policy ADR. A repository record is an auditable human assertion, not an authentication mechanism; Matt records evidence and review verifies it. Environment variables and fixture records cannot confer real approval.

Exclude review controls/code and alternative tokens, words, fonts, and other assets from the complete production output tree. Disposable A/B/C fixtures use the same validation/selection contract in an isolated boundary, remain visibly synthetic, and cannot alter or replace canonical approval. Test builds remain noindex.

## Alternatives

- **Direction environment variable and nonempty approval fields:** small implementation, but silently defaults or accepts unrelated approval records and cannot represent independent copy/tagline choices.
- **Ship all variants and hide them at runtime:** convenient switching, but violates artifact isolation and retains unnecessary code/assets.
- **Delete alternatives after Erik chooses:** simple final source tree, but disrupts comparison and prevents repeatable all-direction verification during exploration.

## Consequences and compatibility

Keep all variants in source during review and select only approved inputs for production. Existing direction-only locks, if any, require explicit migration after recording copy/tagline approval. A future custom copy set needs a reviewed catalog/schema amendment. Stronger artifact inspection must detect unused copied font files as well as text leaks.

Local review stays usable without a lock. Real production builds stay blocked until Erik's choice is recorded. Neither this ADR nor a valid lock closes BRAND-01, resolves other placeholders, substantiates factual claims, approves the final logo, or authorizes deployment/DNS. No secrets or customer data enter browser storage or approval fixtures.

Implementation updates README, the brand-review runbook, and dated bootstrap notes as named in the packages. Review records conformance and both required verdicts under MR-02.

**Open decisions**: None for this policy. The future brand choice remains Erik's separate approval.

**Approval gate**: Complete. Acceptance of this policy is not acceptance of a direction, tagline, or logo.
