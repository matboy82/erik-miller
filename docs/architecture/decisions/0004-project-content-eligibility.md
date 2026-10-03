# Project content eligibility and artifact ownership

**Status**: Accepted
**Approval recorded**: Matt, 2026-10-02 — “approved”; with the MR-03 spec and manifest.
**Date**: 2026-10-02
**Work item**: MR-03
**Governing artifacts**: Approved [story](../../product/stories/website-lead-qualification/mr-03.md), Approved [spec](../../specs/website-lead-qualification/mr-03.spec.md), and [packages](../../specs/website-lead-qualification/mr-03.work-packages.md).

## Proposed MR-09 publication amendment — 2026-10-02

Matt has directed a later owner-operated publication flow: Erik previews the exact rendered portfolio content, personally approves it, and publishes without a PR; the approved content update then triggers the site's normal build/deployment path. This proposed change is specified in [0008](0008-mobile-portfolio-authoring-and-approval.md) and [MR-09](../../specs/website-lead-qualification/mr-09.spec.md). Until 0008 is approved and implemented, this accepted decision remains operative: local Content Layer records are the source, exact Erik sign-off is required, and no remote publishing workflow exists. If 0008 is accepted, it supersedes only the publication/approval recording mechanism; the content provenance, hash matching, production eligibility, and Open-placeholder rules in this ADR remain unchanged.

## Context

MR-03 authorizes licensed stock photos and Draft writeups for development review, with replacement through content records. Production requires approved Miller material and no Open root placeholder. The current output verifier handles brand/font isolation and rejects all binary files; adding project media needs an explicit eligibility and asset-ownership policy.

This ADR addresses a durable content-lifecycle and publication boundary. The accepted [frontend stack](ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md), [0001](0001-bootstrap-foundation.md), and [0003](0003-brand-selection-and-build-isolation.md) remain governing decisions.

## Accepted decision

Use locally authored, schema-validated Content Layer records with separate origin and approval state. Review renders licensed substitutes with derived visible labels. Production admits only approved Miller records whose provenance and Erik sign-off identify the exact image and copy revision. Changed content requires renewed approval; a recorded assertion is auditable evidence, not authentication.

One build-time owner applies eligibility and root-placeholder validation at every production entry. Any Open root entry, missing or inconsistent approval, included stock/Draft content, or unknown required status fails closed. Select content and assets before rendering and verify the complete artifact tree against selected eligible inputs, including image derivatives. Unused, hidden, copied or embedded development assets are forbidden; runtime hiding cannot establish isolation.

Disposable fixtures exercise the same contract in an isolated copy with explicit synthetic evidence. Fixture-local wiring cannot confer canonical approval or close real entries. Keep local review useful while real material is collected; no CMS, datastore, remote publishing pipeline, or launch authority is selected.

## Alternatives

- **Template literals and manually removed labels:** simple initially, but replacement edits layout code and detached labels can misrepresent content.
- **Filter Draft records only at render time:** omits visible content but can still ship stock bytes through public copies, imports or unused derivatives, and bypass root readiness.
- **Introduce a CMS now:** could support later publishing, but adds an unapproved product, permissions and lifecycle beyond this story.

## Consequences, security, and compatibility

Production stays blocked while any real root placeholder is Open, even if all project records are eligible. Existing brand isolation fixtures must stage synthetic content/register evidence as well as brand evidence; passing them proves guard behavior only. Failed production clears its fixed output target.

Local records and license evidence add authoring discipline without a backend. Sanitize media metadata and retain only publishable provenance; no secrets or customer PII enter records, browser bundles, tests or logs. Matt records approval and review checks it; this policy cannot prove the truth of a forged human assertion. Real-content replacement retains substitute history and closes only the verified matching entry.

Implementation delivers the project-content runbook, README and dated bootstrap updates, substitute links in `PLACEHOLDERS.md`, and MR-03 verification evidence. The production boundary requires code-review and fresh-session adversarial verdicts under MR-03. No accepted historical ADR is rewritten.

**Open decisions**: None for this policy. Actual content approval and production release remain separate prerequisites.

**Approval gate**: Complete. Acceptance of the policy is not approval of any photo, writeup, placeholder closure, or deployment.

## MR-06 local review copy amendment — 2026-10-02

Matt directs that Erik must be able to review complete service and area pages before approving their final customer-facing copy. Following the local-preview precedent in approved [MR-05-P2](../../specs/website-lead-qualification/mr-05.work-packages.md), MR-06 may use clearly labeled Draft test copy in the noindex review build while approved page facts and final copy are being collected.

Draft page copy may demonstrate layout, navigation, process explanation, and calls to action. It must stay within facts in approved source artifacts or explicitly identify unverified details as pending review. It must not state unverified prices, credentials, results, review counts, completed work, or actual service coverage as fact. Service-area previews must say that coverage is pending Erik's confirmation. Draft/test copy is never eligible for production and does not approve the brand, real project/review proof, or any factual claim. Production continues to require Erik's approval of the exact published content and the eligibility checks in this ADR.

This dated amendment applies to MR-06 local review only; it does not change MR-03 project-record provenance requirements, the production artifact gate, or other work-item contracts. See the amended [MR-06 spec](../../specs/website-lead-qualification/mr-06.spec.md) and [work-package manifest](../../specs/website-lead-qualification/mr-06.work-packages.md).
