# Durable intake delivery and lead-data lifecycle

**Status**: Accepted
**Approval recorded**: Matt, 2026-10-02 — “all approved.”
**Date**: 2026-10-02
**Work items**: MR-05, MR-07
**Contracts**: [MR-05 spec](../../specs/website-lead-qualification/mr-05.spec.md), [MR-07 spec](../../specs/website-lead-qualification/mr-07.spec.md)

## Context

General inquiries and qualification submissions must survive downstream JobTread outages, resist duplicate submissions, and let an operator recover delayed/partial delivery. The Worker scaffold has no persistence or intake route. JobTread remains the system of record, and the project has not selected a database or authorized a CRM replica. Photos can contain private household information and cannot be logged or left in an unbounded retry store.

## Decision

Use a minimal Cloudflare D1 intake/outbox ledger for accepted submissions and idempotency, Cloudflare Queues for asynchronous delivery of opaque ledger IDs, and private R2 staging only for upload bytes that cannot yet be delivered to JobTread. Worker consumers retrieve the payload from the ledger, write the supported JobTread records, independently verify the result, and mark delivery complete. An operator status/reconciliation view exposes safe state and actions; it does not expose stored payloads. This is operational delivery state, not a searchable CRM or a second customer/job system of record.

Require a unique submission key, state transitions for accepted/processing/delayed/failed/delivered, bounded retries, dead-letter handling, duplicate-safe JobTread reconciliation, and alerting. Delete staged photos as soon as delivery is verified. Delete lead payloads after successful delivery and the minimum explicitly approved recovery/retention window; never enable live capture until that period, deletion behavior, access scope, backup implications, and failure ownership are approved. Requests that cannot be durably accepted receive an error and are not reported as received.

## Alternatives considered

- Queue-only storage: simpler, but message retention is finite and cannot by itself provide durable operator recovery or a controlled PII lifecycle. Cloudflare documents DLQ message expiry and queue retention limits.
- JobTread-only synchronous writes: avoids a local lead store, but loses the inquiry when JobTread is unavailable and cannot meet the approved outage requirement.
- A separate CRM or general-purpose database: out of scope and unnecessary for the bounded intake/outbox contract.

## Consequences and safeguards

- D1, Queues, and R2 add Cloudflare resources, configuration, access controls, cost/retention monitoring, backups, and incident handling that must be included in the approved contract.
- The D1 record is PII-bearing and requires least privilege, encryption/access review, redacted logs, bounded retention, verified deletion, and no broad operator search/export.
- Cloudflare Queues provides asynchronous delivery/retry mechanics, but a dead-letter queue is required because messages otherwise may be discarded after retries. Queue delivery is not proof of JobTread acceptance; the ledger and independent readback are authoritative.
- Photos need explicit type/size validation, metadata stripping where feasible, private object access, checksum verification, and cleanup evidence. A failure to confirm cleanup blocks completion.
- This proposal does not authorize Cloudflare resource creation, credentials, deployment, live JobTread writes, or retention of real leads.

## Sources

- [Cloudflare Queues overview](https://developers.cloudflare.com/queues/)
- [Cloudflare Queues retries and dead-letter queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)
- [Cloudflare Queue message retention and pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- Accepted [0005 JobTread capability boundary](0005-jobtread-capability-verification-boundary.md)

**Implementation boundary**: MR-05 and MR-07 implement this accepted persistence and data-lifecycle decision.
