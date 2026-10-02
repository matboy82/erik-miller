# MR-04 implementation evidence

**Current booking direction amendment — 2026-10-02**: Matt selected Erik-managed Google Calendar Appointment Schedules for phone or in-person consultations, with no web conferences. The earlier Calendly capability matrix below is historical evidence and does not describe the current provider choice. Official Google documentation describes booking pages, appointment locations, availability, buffers and reminders, but Erik's Workspace entitlement/settings and the required appointment-to-JobTread association remain **Unverified**. No Google account was accessed or configured. See [Accepted ADR 0007](../architecture/decisions/0007-consultation-booking-integration-boundary.md).

**Evaluation**: NOT READY — required live intake evidence is missing.
**Selected scope**: MR-04-P1 through MR-04-P3; Matt selected “all” on 2026-10-02.

## Local remediation — 2026-10-02

`validPlan` now rejects malformed and impossible ISO calendar dates, including invalid month/day values and non-leap February 29, while accepting valid leap day and month-end boundaries. Focused tests prove invalid dates stop before credential access and transport dispatch. The current Cloudflare setup guide now reflects Matt's owner-confirmed Google Workspace/Calendly direction and names remaining account, entitlement, calendar, notification, association and write-back prerequisites; it does not authorize setup.

Verification: `node --test scripts/test/jobtread-verification.test.mjs` — exit 0, 20 passed, 0 failed/skipped. `npm run check` — exit 0 on the filesystem-access retry, 29 skills validated, lint/typecheck passed, 45 tests passed, review build and Worker dry-run passed, and production isolation passed for A/B/C and mixed-copy/tagline fixtures. The initial restricted run failed at Wrangler's Worker dry-run with `Cannot read directory "../../../../..": Access is denied`; rerun with local filesystem access completed successfully. Node `v26.9.0`, npm `12.1.0`; npm emitted pre-existing unknown global config warnings for `msvs_version` and `python`.

Live J1/J2 operations, private operation-plan approval, current-candidate remote proof, browser evidence, and fresh-session reviews remain outstanding. MR04-R1 and the MR-04 review verdict remain Block.
**Contract**: Approved [spec](../specs/website-lead-qualification/mr-04.spec.md), [manifest](../specs/website-lead-qualification/mr-04.work-packages.md), Accepted [0005](../architecture/decisions/0005-jobtread-capability-verification-boundary.md).

Local tooling, safeguards and the booking prerequisite assessment are implemented. Read-only JobTread authentication succeeded. Customer/job/field/photo creation and retrieval remain **Unverified** because the exact live-test boundary, side effects and cleanup plan have not been approved. No live records, uploads or appointments were created.

## JobTread findings

| Finding | Evidence kind | Result and limit |
|---|---|---|
| Supported request encoding | Documentation | Public Pave schema refreshed on 2026-10-02; version `bfb7d450125394d0bcd0cecf9c65573b09a56451` unchanged. [Operation inventory](mr-04-api-documentation.md) records customer → location → job, custom-field writes and upload → file → original-photo retrieval. Documentation establishes interfaces, not working intake. |
| Authentication and organization metadata | Live, read-only | Supplied local credential authenticated; one organization found, membership pagination complete. Organization identity remains private and its use as a business/test boundary needs Matt's confirmation. No ordinary customer or photo queries. |
| Existing job fields | Live, read-only | Three job custom fields found, all option types. Field IDs, names and raw metadata remain in the private inventory outside the repository. Approved option values and coverage of project type/location/timeline/budget remain unresolved; no fields were changed. |
| Grant permissions | Live, read-only | Organization-targeted `can` checks allowed customer/job creation. `allowedActions` was null. A location check at organization scope returned false; location creation targets an account, so this does **not** establish an unsupported capability. Account-scoped location, upload/file, field and cleanup permissions remain unresolved. |
| Live J1: records, fields and photo | Unverified | Not run. Must confirm boundary, field samples, transfer origins, permissions, side effects and cleanup/retention, then approve the populated [operation plan](../operations/jobtread-capability-verification.md). |
| J2: duplicate, partial and transient outcomes | Simulation / Unverified live | Tests detect distinct/reused customer IDs, partial job/upload failure, transient errors and ambiguous writes. No automatic retry occurs; returned IDs and pending writes remain in a private run inventory. Actual vendor duplicate/atomicity/retry behavior has not been established. |
| Cleanup | Simulation / Unverified live | Tool verifies marker, organization and parent links, deletes file → job → location → customer, then checks absence. No `deleteUploadRequest` appears in the public schema; orphan upload retention requires explicit approval. Nothing remote was created to clean up in this evaluation. |

Recovery: stop after an uncertain write; reconcile the marked records privately before repeating. Existing or pending inventories cannot blindly restart intake. An inventory storage failure can leave an unknown remote result; retain the inventory and reconcile through the approved account. The probe is single-operator tooling, with no concurrency lock, durable lead store or idempotency guarantee.

## Booking direction and prerequisites

**Native homeowner booking: Unsupported, Owner-confirmed.** Matt's 2026-10-02 instruction confirms the gap and selects Erik's Google Workspace/Calendly. No native-booking tests are required. External behavior is **Unverified** in Erik's account; no account was accessed, provisioned or configured.

| Required outcome | Official interface and remaining prerequisite |
|---|---|
| Public self-booking | Calendly documents a scheduling link or website embed. Erik must supply the approved event type, duration, location and public sharing decision. [Event types](https://calendly.com/help/how-to-set-up-an-event-type) |
| Availability and buffers | Calendly documents availability rules, meeting limits, notice and buffers. Erik must supply working hours, travel/buffer rules and availability ownership. [Availability settings](https://calendly.com/help/how-to-fine-tune-your-availability-settings) |
| Timezone handling | Calendly detects host/invitee timezones and can lock the event-location timezone. Confirm Erik's timezone and test daylight-saving transitions before release. [Timezone settings](https://calendly.com/help/how-to-fine-tune-your-availability-settings) |
| Conflict prevention | Calendly checks selected Google calendars for busy events and adds meetings to a selected calendar. Confirm calendar access, all conflict calendars and the write calendar; test overlapping bookings and sync delays. Documentation does not prove live concurrency behavior. [Google connection](https://calendly.com/help/how-to-connect-your-google-calendar) |
| Confirmations and reminders | Calendly documents calendar invitations, email confirmations and automated email/text reminders. Confirm applicable entitlements, notification owner, message content and approved test recipients; delivery has not been tested. [Notifications](https://calendly.com/help/automations-notifications) |
| Cancellation/rescheduling | Invitee cancel/reschedule URLs are documented. Rescheduling emits both created and canceled webhooks with old/new invitee references. Later implementation must reconcile those events and test calendar sync. [API FAQ](https://developer.calendly.com/docs/getting-started/frequently-asked-questions), [reschedule payloads](https://developer.calendly.com/docs/api-guides/see-how-webhook-payloads-change-when-invitees-reschedule-events) |
| Customer/job association | Calendly can send `invitee.created`/`invitee.canceled` to our server with user/organization scope. Confirm credentials and scope, an opaque booking-to-JobTread correlation method, an approved JobTread write-back target and its permissions. Email matching alone is insufficient. No mapping or write-back has been implemented. [Webhooks](https://developer.calendly.com/docs/api-guides/receive-data-from-scheduled-events-in-real-time-with-webhook-subscriptions) |

Direct integration is **feasible at the documented interface level**: a future approved server can receive Calendly webhooks and call JobTread directly, without Zapier/Make. This is an inference from the documented interfaces, not a verified end-to-end workflow. Calendly requires a paid Standard, Teams or Enterprise subscription for webhooks; Erik's entitlement is unknown. [API FAQ](https://developer.calendly.com/docs/getting-started/frequently-asked-questions)

If later work needs direct Google API access, [free/busy](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query) and [event insertion](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert) are documented separately. Calendar authorization/scopes and event timezone/reminder settings need approval. Reading availability then inserting an event does not establish an atomic reservation. Avoid adding direct Google writes until the later booking contract settles ownership.

Dependent booking work needs an approved endpoint/hosting contract, webhook authentication/replay handling, event ordering/reconciliation, secret storage and PII retention rules. Intake commitments remain blocked on live J1. CRM-01 and SCHED-01 remain Open.

## Contract coverage

| Criterion / package | Status | Evidence or missing work |
|---|---|---|
| AC1; J1 source/boundary/permissions | Partial | Durable report distinguishes evidence kinds; read-only metadata succeeded. Exact writable boundary and complete permissions unresolved. |
| AC2; live J1 | Blocked | Local comparisons pass, but required live creation, retrieval and photo identity checks are not run. |
| AC3; J2 | Partial | Simulated duplicate/partial/transient/ambiguous cases pass; approved live repeated submission and reconciliation remain missing. |
| Amended AC4; J3 | Proven within discovery scope | Owner-confirmed native gap and external prerequisites recorded; no claim of live external booking. |
| Amended AC5; J3 | Proven within discovery scope | Selected Google Workspace/Calendly direction, documented direct interfaces and explicit access/entitlement/association blockers. No provisioning. |
| AC6; F4 | Partial | Sanitized output, offline fixtures and dependency boundaries verified locally; full live constraints and cleanup remain unverified. |
| P1 | Proven | Official inventory, read-only findings, plan template, permissions and abort/cleanup procedure. Missing runtime inputs are explicit stop conditions. |
| P2 | Proven locally | Probe, original fixture, safeguard tests, restored sensitivity checks and repository checks. Local transport results are Simulation. |
| P3 | Partial | Booking assessment and documentation done; live J1/J2 and cleanup gate unresolved. |

## Verification

Environment: Windows PowerShell; Node v26.9.0; npm 12.1.0. Baseline HEAD `747fbd57a73b29f0457e04036263fbf9261153f2`; implementation remains uncommitted. No UI change or new Lighthouse/coverage threshold applies.

| Command/check | Actual result |
|---|---|
| `node --test scripts/test/jobtread-verification.test.mjs` | Exit 0; 19 passed, 0 failed/skipped. Covers offline refusal, credential/destination isolation, boundary/schema checks, linked records, paginated fields, photo identity, duplicate/failure/recovery/cleanup and CLI stdout/stderr sentinels. |
| TDD red/green | Initial missing-module run failed; guards passed after implementation. J1/J2 expansion failed before implementation; later schema/permission guards failed before their implementation. Full restored suite passes. |
| `node --test --test-name-pattern='incomplete, unapproved' scripts/test/jobtread-verification.test.mjs` with plan guard bypassed | Exit 1; test detected one unauthorized dispatch instead of zero. Exact original bytes restored. |
| `node --test --test-name-pattern='F4 raw payload extensions' scripts/test/jobtread-verification.test.mjs` with synthetic credential exposed | Exit 1; sentinel exclusion assertion failed. Exact original bytes restored. |
| `node --test --test-name-pattern='J1 detects wrong links' scripts/test/jobtread-verification.test.mjs` with comparison failure disabled | Exit 1; incorrect data was marked Verified and test rejected it. Exact original bytes restored; focused suite returned green. |
| `npm run check` | Restricted run exited 1: skills/lint/typecheck and 44 tests passed, but Worker bundling could not read a parent directory. Same command rerun with approved sandbox escalation exited 0: 29 skills validated; lint and typecheck (0 errors/warnings); 44 tests passed, 0 failed/skipped; review web build, Worker dry-run and production isolation passed. Logs retained locally under `.tmp/mr04-check*.log`. |
| Final delta: `node --test scripts/test/jobtread-verification.test.mjs`; `npm run lint` | Both exit 0 after tightening transfer-URL credential exclusion. Its owning test exited 1 before the fix and the final focused suite passed all 19. The broader check's test run preceded this final safeguard; the change affects only probe transfers, with no application/build wiring change. |
| `git diff --check` | Exit 0. Untracked implementation files also checked for trailing whitespace by the audit below. |
| `node .tmp/mr04-audit.mjs` | Exit 0: 10 source/document files, 61 local links and 24 built artifacts inspected; actual local key excluded, probe/fixture excluded from artifacts. No credential values printed. |
| `rg -n 'jobtread-verification\|jobtread-probe' apps .github package.json scripts/build.mjs scripts/astro.mjs` | Exit 1: no application, CI or build imports/references. No focused/skipped tests or temporary mutation markers found in probe/test sources. |
| `node scripts/jobtread-verification.mjs` | Exit 0: help only, no credential access or network operation. |
| Live J1/J2/cleanup, booking delivery/conflict tests | Not run; authorization/prerequisites missing. |
| Fresh-session code/adversarial review | Not run; required before review/release completion. Same-session inspection is not independent review. |

The original 2×2 geometric PNG is 76 bytes, MIME `image/png`, SHA-256 `b6ba2d6864061786b71b452c2554fec7b41e41626fad7c49e4686e2a42fc43d3`. It is a probe fixture, not Miller project content. Vendor upload size/rate/retention limits remain unverified; local byte/request/timeout bounds are operator safeguards, not vendor guarantees.

Existing npm environment/global configuration warnings for `msvs_version`/`msvs-version` and `python` appeared in both check runs; no dependency/configuration changes were made to suppress them. Read-only metadata commands used `node --env-file=.env .tmp/jobtread-docs/preflight.mjs` and `.tmp/jobtread-docs/permissions.mjs`, with sanitized summaries and private metadata outside the repository. `.env` and `.tmp` are ignored; `.env` is untracked.

## Changes and next action

Implementation adds the probe, tests, original fixture, [runbook](../operations/jobtread-capability-verification.md) and this report, plus README and dated bootstrap links. Prior planning/approval edits to PLACEHOLDERS, epic, story, QA, ADR 0005, spec/manifest and API documentation are preserved. No application route, dependency, CI credential, Cloudflare binding, deployment, commit or placeholder closure is added.

Populate the private plan from the confirmed organization, option values and transfer origins; resolve workflow side effects, target-scoped permissions and cleanup/orphan retention. Matt then approves the exact writes/cleanup before J1 and a separately bounded J2 repeat. This gate comes from the approved spec's **Execution plan and live-action gate**: “Spec/package approval alone does not authorize external writes.” The [implementation skill](../../.agents/skills/sdd-implement/SKILL.md) requires a NOT READY result when evidence is incomplete. A blanket package selection does not override that explicit live-action gate.
