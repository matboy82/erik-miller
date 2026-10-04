# General inquiry intake operations

**Current implementation (2026-10-03):** Contact and project forms are connected through a configured public intake URL. Private photo delivery, automatic calendar task synchronization, and the operator page are implemented locally. Use [functional launch setup](functional-launch.md) for current configuration and verification; the older preview-only statements below describe the MR-05 prototype.

MR-05 uses D1 as a short-lived delivery ledger and Queues for asynchronous JobTread delivery. JobTread remains the system of record. The Worker never returns a lead payload or offers general search/export.

## Local/demo

- Intake is disabled unless `INTAKE_ENABLED=true`. Leave it unset in review/test configuration; set it only after every live prerequisite below is evidenced and separately authorized.
- Use only synthetic values and the test copy in the MR-05 spec. Do not connect live JobTread credentials or collect real lead data.
- A caller generates a UUID `Idempotency-Key` for a new inquiry and reuses it for retries. Reusing the key with changed content returns a conflict.
- An `accepted` receipt means D1 commit and queue enqueue succeeded. Queue delay or JobTread failure does not change that receipt.

## Before enabling live intake

### Cloudflare Workers Builds setup

The connected Worker is `erik-miller-worker`. Run these commands from the repository root while authenticated to the same Cloudflare account used by Workers Builds:

```powershell
npx --no-install wrangler login
npx --no-install wrangler queues list --config apps/worker/wrangler.jsonc
npx --no-install wrangler queues create miller-intake-dead-letter --config apps/worker/wrangler.jsonc
npx --no-install wrangler d1 list --config apps/worker/wrangler.jsonc
```

Create `miller-intake-dead-letter` only if it is missing. Also create `miller-intake-delivery` if it is absent. Both queues must exist before deployment; the dead-letter consumer records exhausted delivery attempts as failed. Keep that consumer and the delivery queue's `dead_letter_queue` setting.

Confirm the configured `database_id` in `apps/worker/wrangler.jsonc` matches `miller-remodeling-intake` in the intended account. If that database is absent, create it with `wrangler d1 create miller-remodeling-intake --config apps/worker/wrangler.jsonc` and use the returned ID. Apply its schema before enabling intake:

```powershell
npx --no-install wrangler d1 migrations apply INTAKE_DB --remote --config apps/worker/wrangler.jsonc
```

Workers Builds uses build command `npm run build:worker` and deploy command `npx --no-install wrangler deploy --config apps/worker/wrangler.jsonc`. A successful dry-run build validates the bundle, but does not verify that these remote resources exist. After provisioning the queues and setting the database ID, rerun the connected build.

### Live prerequisites

1. Create the named D1 database and delivery/dead-letter queues in the approved Cloudflare account, apply migrations, and verify backup retention/deletion behavior.
2. Configure Cloudflare Access for the operator endpoints. Restrict the application to Erik and Matt; set `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, and an email allowlist containing only those two individual identities. The empty/missing configuration fails closed.
3. Configure JobTread API credentials as Worker secrets, plus the approved organization ID and existing Contact custom-field IDs for email and phone. The two fields must be appropriate text/email/phone fields. Do not invent or create JobTread fields in this workflow.
4. Configure Cloudflare account notifications for Erik and Matt on oldest pending age (24 hours), DLQ count, failed reconciliation, and retention cleanup errors. Confirm delivery with synthetic events.
5. Verify the field/copy approval from Erik, exact JobTread operation plan and cleanup approval from Matt, retention/deletion behavior, permissions, and notification/workflow side effects.
6. Apply and inspect a synthetic end-to-end operation under that separately approved plan. Retrieve the created Contact custom field value and the Job → Location → Customer links independently. Clean up or record explicitly approved retained artifacts.

None of those Cloudflare account changes, secrets, live JobTread writes, or deployment actions is authorized by MR-05 implementation approval.

## Delivery and reconciliation

Queue messages contain only receipt UUIDs. The consumer checkpoints each JobTread write in D1. A write with an unknown outcome is not retried automatically. The unique `MR05-XXXXXXXX` marker is placed in the JobTread customer/location/job names to help an operator locate the exact synthetic record in the JobTread UI. The dead-letter queue has a separate consumer that marks the ledger failed and emits a safe `intake_dead_letter` event; configure a Workers Observability alert/automation to notify the approved operators.

Use the Access-protected status endpoint to inspect receipt state, step, attempts, timestamps, and safe error category. It never reveals stored payload or raw JobTread response. For an `external_result_unknown` error, inspect JobTread for the marker before using the reconcile endpoint. Record the exact step as present with its JobTread record ID, or absent only after confirming no record was created. Then enqueue continuation. Do not retry ambiguous writes without this readback.

## Retention, alerting, and rollback

- Delete delivered payloads seven days after verified readback. Retain only receipt metadata for 90 days.
- Retain undelivered payloads for at most 30 days after acceptance, then delete the payload and keep a payload-free failure tombstone for 90 days.
- The scheduled cleanup emits only a safe count/category if payload expiry occurs. Configure account-level notifications before live use; cleanup failures must alert and remain visible.
- Pending receipts older than 24 hours and queue/DLQ failures need operator attention. Review status, reconcile JobTread first, and retry only safe states.
- Disable new intake at the edge during rollback. Preserve accepted records until reconciliation or the defined deletion deadline; do not delete the D1 database or queues to roll back.

## Cloudflare references

- [Queue dead-letter behavior](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Workers Observability Issues](https://developers.cloudflare.com/workers/observability/issues/)
