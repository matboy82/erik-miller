# Verify JobTread capabilities

MR-04 uses local operator tooling, not an intake endpoint. [The approved contract](../specs/website-lead-qualification/mr-04.spec.md) and [official operation inventory](../project/mr-04-api-documentation.md) govern the run. The public schema was refreshed on 2026-10-02; its version remains `bfb7d450125394d0bcd0cecf9c65573b09a56451`.

## Before a live run

Matt must approve a populated operation plan. Keep it and the run inventory in a private local directory outside the repository. Do not put credentials in either file. Load the ignored `.env` with Node; `JOBTREAD_API_URL` must be `https://api.jobtread.com/pave` and `JOBTREAD_API_KEY` supplies the runtime grant key.

Required plan values:

| Field | Required value |
|---|---|
| `version`, `apiVersion` | `1` and the reviewed API version above. |
| `approvedBy`, `approvedOn` | `Matt` and the date of exact live-write approval; leave unset until approved. |
| `organizationId`, `boundary` | The explicitly approved organization ID; `isolated-synthetic` or explicitly approved `business-synthetic`. No ordinary customer queries. |
| `runMarker` | Unique `MR04-` marker using letters/numbers/hyphens, at most 24 characters; record names derive from it. |
| `customFieldValues` | Nonempty map of existing job custom-field IDs to approved synthetic primitive values. Use representative project type, location, timeline, budget and description where supported; missing field definitions are blockers. No schema changes. |
| `imageSha256`, `imageBytes` | Checksum and byte count of the original geometric PNG fixture under `scripts/test/fixtures/jobtread-probe.png`. No people/private metadata. |
| `transferOrigins` | Exact official HTTPS upload/download origins confirmed before writes; no wildcard, private address or API origin. If unknown, live mode stays blocked. |
| `sideEffectsReviewed` | `true` only after confirming configured workflows/notifications cannot contact real people. Root `notify:false` is not sufficient evidence. No notification delivery is tested by this probe. |
| `permissionsReviewed` | `true` only after confirming the listed operation permissions and target scopes using the supplied grant; do not broaden access. |
| `cleanup` | `delete-records` with confirmed permission/dependency checks, or `retain-approved` with Matt's explicit retention decision. |
| `cleanupReviewed`, `orphanUploadRetentionApproved` | `true` after confirming deletion/retention and explicitly accepting the vendor's orphan-upload policy. The public schema has no delete-upload-request operation. |
| `maxAttempts`, `requestBudget`, `timeoutMs` | `1` for intake or `2` for an approved repeated submission; an approved bounded request budget (1–100) and timeout (1,000–30,000ms) consistent with vendor limits. |

Resolve actual field values, organization, transfer origins, side effects, permissions and orphan retention before marking the plan approved. The approval fields record human authorization; they are not authentication. Missing values refuse live execution.

## Operations and permissions

1. Read the selected organization ID to verify the boundary; do not list customers.
2. `createAccount(organizationId, name, type:"customer", notify:false)` → retrieve `createdAccount.id`.
3. `createLocation(accountId, name, parseAddress:false)` → retrieve `createdLocation.id`.
4. `createJob(locationId, name, description, customFieldValues)` → retrieve `createdJob.id`.
5. Retrieve the job, including `location.account` and all custom-field pages. Compare independent expected values, names and organization IDs.
6. `createUploadRequest(organizationId, size, type:"image/png")` → use returned ID, URL, method and headers to upload bytes. Never send the grant key to that destination.
7. `createFile(name, targetId:jobId, targetType:"job", uploadRequestId)` → retrieve file record, verify its job and original-photo checksum.
8. For an explicitly approved duplicate scenario, repeat once with the same synthetic names and compare resulting IDs/outcomes. This investigates vendor behavior; it implements no idempotency guarantee.

Check the grant's required permissions before writes: customer/location/job creation, reading the selected organization and created records/custom-field values/files, job-field writes, upload/file creation and the selected cleanup actions. The schema's `can(action,id)` and nullable `grant.allowedActions` describe permission inspection; they do not guarantee access. Confirm proper target scopes through the official explorer/account permissions. Do not expand the grant implicitly.

The probe records each returned synthetic ID to the private inventory before moving to the next stage. If inventory storage fails, stop and retain the current in-memory IDs for reconciliation. Never print raw responses or signed URLs.

## Run and interpret

Copy this draft to a private directory outside the repository. Empty values and `false` checks deliberately prevent execution. Populate them from the approved account and official metadata; record Matt's approval last.

```json
{
  "version": 1,
  "apiVersion": "bfb7d450125394d0bcd0cecf9c65573b09a56451",
  "approvedBy": "",
  "approvedOn": "",
  "organizationId": "",
  "boundary": "",
  "runMarker": "MR04-20261002-a",
  "customFieldValues": {},
  "imageSha256": "b6ba2d6864061786b71b452c2554fec7b41e41626fad7c49e4686e2a42fc43d3",
  "imageBytes": 76,
  "transferOrigins": [],
  "sideEffectsReviewed": false,
  "permissionsReviewed": false,
  "cleanup": "delete-records",
  "cleanupReviewed": false,
  "orphanUploadRetentionApproved": false,
  "maxAttempts": 1,
  "requestBudget": 60,
  "timeoutMs": 10000
}
```

This proposes one marked customer, location, job, upload request and attached 76-byte image, without contact details or appointments. Cleanup proposes deleting the four records after checking their ownership and absence; upload-request/byte retention needs explicit approval. The original fixture was generated locally from geometric pixels and contains no private photo or metadata. No deliberate live failure is proposed. A duplicate run needs a separately approved marker/inventory and `maxAttempts:2`; it can create two of each artifact. Resolve missing representative field definitions before making capability claims.

From the repository root, using operator-selected private paths:

```powershell
node scripts/jobtread-verification.mjs --plan C:\private\mr04-plan.json
# Only after Matt approves that populated plan:
node --env-file=.env scripts/jobtread-verification.mjs --plan C:\private\mr04-plan.json --live --scenario intake --inventory C:\private\mr04-inventory.json
node --env-file=.env scripts/jobtread-verification.mjs --plan C:\private\mr04-plan.json --live --scenario cleanup --inventory C:\private\mr04-inventory.json
```

The private directory must already exist. Those paths are examples, not a provisioned directory. An invalid plan or failed run exits 1 with a safe category. A valid offline plan exits 0 but remains `Unverified`. Protect private files with local access controls; Node's file mode is not a Windows ACL guarantee. Never run concurrent processes against the same marker/inventory, overwrite an existing inventory, or delete it to bypass reconciliation.

The CLI defaults to offline plan validation. Live mode is opt-in and must only be used after the exact plan approval. See the command help with `node scripts/jobtread-verification.mjs --help`. Local doubles produce Simulation evidence; live results require actual record/photo retrieval.

The intake run creates at most one customer, location, job, upload request and attached file per attempt. A request budget or timeout stops new work. No write is retried automatically. A timeout/transport failure after a write may mean it succeeded: inspect the marked synthetic records through the approved account boundary before rerunning. The inventory cannot prove an unknown write did not create a record.

## Cleanup and abort

For `delete-records`, use the cleanup scenario only for the same approved run inventory. Verify ownership by exact marker, organization and links before deletion; remove attached files, jobs, locations and customers in that order, then retrieve each to verify absence. Confirm the vendor's dependency/cascade behavior before authorizing this sequence. Unattached uploaded bytes/upload requests need the previously approved retention policy or a separately authorized supported cleanup path.

For `retain-approved`, do not delete; record retained synthetic records and the explicit retention decision. Unexpected recipients, boundary mismatch, unknown outcomes, cleanup failure or exhausted budgets block more writes. Deleting local tooling does not remove remote artifacts. Report unresolved IDs privately and retained counts publicly.

## Evidence and booking follow-up

Save only sanitized results to [MR-04 evidence](../project/mr-04-verification.md): scenario, evidence kind, safe comparisons, stage/error category, recovery and cleanup status. Credentials, raw IDs, private responses, headers and signed URLs stay out of repository/logs.

Matt confirmed native homeowner booking is unsupported. Erik's Google Workspace/Calendly is the selected direction. MR-04 assesses external prerequisites; booking configuration, real recipients, Google/Calendly credentials and event synchronization require a later approved contract.
