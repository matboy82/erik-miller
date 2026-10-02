# MR-04: Official API requirements check

**Work item**: MR-04
**Checked**: 2026-10-02
**Evidence**: Public documentation and schema only; no credential used, customer queried, or record changed.

## Finding

JobTread exposes the operations needed for the intake capability test. Correct the proposed sequence to **customer → location → job**, then upload and attach the photo. Reliable duplicate/retry handling remains unverified. Matt subsequently confirmed the native homeowner-booking gap and selected Google Workspace/Calendly; that owner-confirmed finding is recorded below, separately from the API evidence.

The supplied [Open API page](https://www.jobtread.com/integrations/open-api) links to the [official API explorer](https://app.jobtread.com/docs). This is a Pave query API with a published runtime schema, rather than a Swagger/OpenAPI specification. The documentation renderer requests that schema from the API.

## Source and reproducibility

- Public endpoint: `POST https://api.jobtread.com/pave`.
- Read-only request: `{"query":{"schema":{},"version":{}}}`. It returned HTTP 200 without authentication.
- Returned API version: `bfb7d450125394d0bcd0cecf9c65573b09a56451`.
- SHA-256 of the locally saved UTF-8 schema response: `7E3F47BA2140417DFFE89B1DE1A1CFCE8739A0734556A320608D7FDC61203679`.
- Inspection copies are under ignored `.tmp/jobtread-docs/`. They contain public documentation only. A repeat download can differ if JobTread changes the schema or serialization.

The linked explorer exposes the paths named below. Its public documentation renderer also supplies authentication and custom-field examples. A public tutorial search for `API` returned no results; it supplied no additional evidence.

## Intake requirements

| Requirement | Official schema/documentation finding | Remaining live check |
|---|---|---|
| Authentication | The request envelope is `query`; the grant key belongs in `query.$.grantKey`. Root inputs also include `notify` and IANA `timeZone`. Documentation states grants expire after three months of inactivity. | Confirm the supplied key's access without retaining its value. |
| Create customer | `root.createAccount` requires `organizationId`, `name`, and `type`; use `type: "customer"`. Retrieve `createdAccount.id` and the account record. | Confirm account permissions and returned values. |
| Link job to customer | `root.createLocation` requires `accountId`. `root.createJob` requires `locationId`; the schema explicitly describes customer → location → job. Retrieve `job.location.account` to check the relationship. | Create and retrieve all three synthetic records. Direct customer → job is an incomplete plan. |
| Write custom fields | Create/update account, location and job operations accept `customFieldValues`. Official examples map custom-field IDs to values; records expose paginated `customFieldValues`. | Identify existing field IDs/types for the approved samples and compare retrieved values. Do not create field definitions implicitly. |
| Upload photo | `root.createUploadRequest` returns `createdUploadRequest.id`, `url`, `method` and `headers`. Upload using those returned instructions, then call `createFile` with the upload ID, `name`, `targetId` and `targetType: "job"`. The current method resolves to `PUT`. | Verify byte upload, attachment and retrieval. Do not assume a fixed upload host or headers. |
| Retrieve photo | `root.file` and `job.files` expose file records. `file.url` accepts `original` and `download` options and can return null. | Retrieve original bytes and compare checksum or a documented equivalent; never retain signed URLs. |
| Permissions | `root.can(action, id)` exposes a permission check; `grant.allowedActions` is nullable. Actions include customer/location/job creation, record reads/updates and deletion. | Confirm applicable actions and target scopes; schema presence does not grant permission. |
| Cleanup | `deleteFile`, `deleteJob`, `deleteLocation` and `deleteAccount` are documented writes taking an ID. Account archival is also exposed. No `deleteUploadRequest` operation is listed. | Confirm dependency/cascade behavior, orphan-upload retention and cleanup permissions before writes. A delete operation's existence does not prove safe cleanup. |

The existing `.env` uses `JOBTREAD_API_URL` and `JOBTREAD_API_KEY`; Git ignores it and does not track it. Only variable names were inspected for this report. Later local tooling can load it with Node's `--env-file=.env`; Cloudflare's backend reads the corresponding configured values, storing the key as a secret. No Cloudflare variable or secret was changed.

## Limits and failure behavior

The schema sets a 30-character job-name limit and a 32,768-character job-description limit. Upload size, when supplied, must be a positive integer; this schema does not establish a maximum upload size or complete supported MIME-type list. Paginated connections expose `nextPage`; check every page needed for comparison.

Official documentation acknowledges rate limits without a numeric allowance. Root `notify` defaults to true; `createAccount` and `createTask` also expose notification inputs. Suppressing a notification flag does not prove configured workflows have no side effects.

No idempotency-key input or durable-retry guarantee was identified in the inspected operations. `createAccount.suffixIfNecessary` handles name uniqueness and is not a submission-idempotency guarantee. Transaction atomicity, ambiguous-result recovery, safe repeats, transient errors and exact rate/upload limits still need J2 evidence or further official clarification.

## Booking requirements — original schema findings

| QA capability | Finding from the public schema |
|---|---|
| Public homeowner self-booking | Unverified. No public slot-selection/booking contract was identified. |
| Availability and buffers | Unverified. No consultation availability/buffer contract was identified. |
| Timezones | IANA timezone handling and timed tasks are documented; homeowner/Erik consistency and daylight-saving behavior remain unverified. |
| Conflict prevention | Unverified. Task creation does not establish exclusive slot reservation. |
| Confirmations and reminders | Notifications and workflows exist; booking-specific delivery behavior remains unverified. |
| Cancellation and rescheduling | Task updates/deletion exist; a homeowner cancellation/rescheduling flow remains unverified. |
| Customer/job association | Tasks accept a target record/type; this does not establish a native booking appointment contract. |

The schema gaps alone did not prove native booking unsupported. The following owner-confirmed amendment supplies the domain finding and supersedes further native discovery.

## Owner-confirmed booking amendment — 2026-10-02

Matt states: “I already know booking and other functionality doesn't exist in jobtread, we'll hook into Eriks' google workspace/calendly for those functions.” Record the required native homeowner-booking workflow as **Unsupported**, with **Owner-confirmed** evidence. This is Matt's domain confirmation, not a live API-test result and not a claim that JobTread lacks its documented task/notification features.

Google Workspace/Calendly is the selected direction. Skip native-booking discovery. Amended J3 documents external-provider/calendar access and entitlements, direct-integration feasibility without Zapier/Make, and the JobTread record-association contract still needed. Provider behavior and account setup are not verified or implemented by this decision.

This check supplies the documented operation inventory for technical planning. J1 live record/photo checks, J2 recovery observations and amended J3's external prerequisite assessment remain outstanding.
