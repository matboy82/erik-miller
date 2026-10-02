# Verify JobTread before building the integration

**Status**: Accepted
**Approval recorded**: Matt, 2026-10-02 — “Approved.” Includes the MR-04 spec and complete work-package manifest, with the booking amendment below.
**Date**: 2026-10-02
**Work item**: MR-04
**Contract**: [Story](../../product/stories/website-lead-qualification/mr-04.md), [spec](../../specs/website-lead-qualification/mr-04.spec.md), [work packages](../../specs/website-lead-qualification/mr-04.work-packages.md).

## Accepted booking amendment — 2026-10-02

Matt confirms JobTread does not provide the required homeowner booking functions. Use Erik's Google Workspace and Calendly for those functions; skip further native-booking discovery. MR-04 records this owner-confirmed finding and the remaining external-integration prerequisites. Provider configuration and implementation belong to a later approved booking spec.

The original decision below remains for history; this amendment replaces its pending booking-service selection.

## Decision

Test JobTread locally before building intake or selecting a booking service. Use the API URL and key in Matt's ignored `.env`. When the integration is deployed, read those values from server-side Cloudflare configuration, with the key stored as a secret. Keep credentials out of the website, repository and logs.

Use clearly marked test records only. Matt approves the exact writes and cleanup before live tests. After an uncertain write result, check what was created before trying again.

## Why

The [official API review](../../project/mr-04-api-documentation.md) confirms customer, location, job, custom-field and photo operations. It does not establish public homeowner booking or prove those operations work with our account permissions. API support and successful live tests are separate findings.

Local tests let us answer those questions before adding a deployed endpoint or building a full intake system. That is the smaller alternative for this verification story.

## Result

MR-04 delivers a capability report. Production intake, retry storage and booking implementation need later approved specs. The existing [frontend](ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md) and [test deployment](0002-test-deployment-isolation.md) decisions still apply.

**Approval gate**: Complete. Live test writes require separate approval; booking/account setup is not authorized by this approval.
