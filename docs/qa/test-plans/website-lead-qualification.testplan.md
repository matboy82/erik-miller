# Website and lead qualification: foundation QA plan

**Status**: Approved
**Approval recorded**: Matt, 2026-10-01 — “approved”
**Owner**: Matt / BIS; Erik reviews brand and content
**Created**: 2026-10-01
**Scope**: MR-01 through MR-04 foundation (approved 2026-10-01); MR-05 through MR-13 remaining epic scope (approved 2026-10-02)
**Inputs**: Approved [epic](../../product/epics/website-lead-qualification.md) and stories MR-01–MR-13; foundation MR-01–MR-04 contracts and the approved MR-01–MR-04 fix spec; see links in the foundation and remaining-story amendments below.
**Next gate**: `$sdd-tech-spec` drafts MR-05–MR-13 developer specs, work packages, and Proposed ADRs for separate human approval.

**MR-01 deployment amendment (2026-10-01)**: Matt requested Cloudflare Git integration. GitHub verifies only; Cloudflare publishes independently. The updated F2 scenario below replaces the prior GitHub-gated upload matrix.

**Historical MR-04 booking amendment (2026-10-02)**: Matt confirmed the JobTread gap and initially selected Google Workspace/Calendly. This direction was later superseded as described below; retain the dated evidence for history only.

**Current booking direction (Matt, 2026-10-02)**: Use Google Calendar Appointment Schedules, managed by Erik, with phone and in-person meeting modes and no web conferences. Accepted [ADR 0007](../../architecture/decisions/0007-consultation-booking-integration-boundary.md) records this selection and supersedes Calendly. J3 verifies applicable Workspace entitlements/settings and records the appointment-to-JobTread association as Unverified until its exact supported path passes. No account setup or live test is authorized by this QA plan.

**MR-06 local page-copy amendment (Matt, 2026-10-02)**: Erik reviews complete noindex pages using clearly labeled Draft test copy before approving final public copy. Draft copy must identify unverified details as pending and may not claim unverified prices, credentials, results, review counts, completed work, or service coverage. Production still requires Erik's exact-content approval and the existing content gates; see Accepted [0004](../../architecture/decisions/0004-project-content-eligibility.md).

## Decision and boundaries

Prove that the review foundation is reachable and safe, brand alternatives remain reviewable, temporary content can be replaced without layout changes, and JobTread capabilities have evidence before dependent features are promised. The stories already record approval; this plan does not change them.

Highest risks are publishing after failed checks, exposing secrets to forks or client assets, shipping development content or alternative brand code, closing placeholders without evidence, and mistaking documentation for working JobTread intake or homeowner booking.

Exclude production launch, DNS, account provisioning, full service pages, wizard/intake implementation, durable retries, scheduler implementation, and publishing/review automation. Planning these checks authorizes no push, deployment, secret change, external account change, or live JobTread mutation. Later execution needs the corresponding approved contract and action authorization.

## Proposed test seams

| Boundary | Method and observable outcome |
|---|---|
| Repository commands and generated artifacts | Existing Node `node:test` suites, `npm ci`, `npm run check`, `npm run lighthouse`, `npm run build:production`, and `npm run check:production`. Assert exit status and inspect complete output trees, including unused media and bundled copy. Extend meaningful guard tests through the existing `verifyProduction(directory, direction)` boundary where applicable. |
| Worker health handler | Existing `worker.fetch(Request)` tests prove HTTP behavior locally; live HTTPS `/health` independently proves the deployed Worker. No intake route is introduced. |
| GitHub workflow and Cloudflare URLs | Inspect event/job conditions and capture authorized remote run outcomes, revision, deployment URLs, and live responses. A local workflow inspection or mock cannot prove remote secret isolation or publication. |
| Rendered review page | Manual browser interaction with existing direction/tagline controls, DOM text, computed styles, keyboard focus, and browser storage. Inspect content records and rehearse replacement through their eventual authoring boundary; assert the rendered result. |
| JobTread supported external interface | Official documentation plus authorized synthetic operations through the supported API/account interface. Retrieve created records and photo content to verify results. Do not add a production endpoint or invent Pave calls for testing. |

No new browser automation dependency is proposed. Manual browser evidence complements the existing Lighthouse runner. MR-03's content-record shape and MR-04's supported operations are technical-planning decisions; this plan approves observable boundaries rather than a new public test interface.

## Scenarios and acceptance traceability

AC references point to the numbered criteria in the linked stories. Each row defines the smallest scenario group for the stated risk; record each listed branch separately.

| ID | AC coverage | Scenario and required evidence |
|---|---|---|
| F1 | MR-01 AC1 | In an isolated fresh checkout of the candidate revision, use Node 24+, `npm ci`, `npm run check`, and mobile Lighthouse. Record versions, revision, exit codes, full command logs, and Lighthouse reports. Do not reset the user's worktree to obtain a clean checkout. |
| F2 | MR-01 AC2, AC4 | Confirm GitHub runs verification only and has no publication job or Cloudflare credentials. Capture separate Cloudflare main builds for Pages and Worker, a trusted-branch Pages preview, and an app-build failure that prevents publication for that app. Record Pages preview branch restrictions and main-only Worker configuration. GitHub verification failure does not gate Cloudflare publication. Record revision, build/run results, and actual URLs; never print secrets. |
| F3 | MR-01 AC3, AC5 | On persistent and PR-preview URLs, fetch the page, `robots.txt`, and HTTP headers: reachable page, noindex meta, disallow robots rules, and noindex response header. Confirm neither uses the business domain. Separately capture live Worker `/health` HTTP 200 and scaffold response. |
| F4 | MR-01 AC6; MR-04 AC6 | Compare setup instructions with actual workflow/configuration secret and variable names. Inspect source, all built client assets, fixtures, logs, and report evidence for credentials/PII. Use harmless unique credential sentinels in isolated local checks where useful; never embed real secrets or retain raw sensitive responses. Infrastructure entries close only with their exact live unblock evidence. |
| B1 | MR-02 AC1, AC2, AC4 | Empty storage starts at A. Select A/B/C and every exposed copy choice; compare tagline, hero, process text, palette, and font pairing with the pinned branding kit. Reload each saved theme; missing, unknown, malformed, and unavailable storage yield a usable page with the required A fallback for invalid themes. Verify current selections and visible Draft notices; no final approval or unsupported factual claim is implied. |
| B2 | MR-02 AC3; MR-03 AC4 | Keyboard-only and touch walkthrough across A/B/C, 320px and 390px mobile widths, and desktop at 200% zoom. Check labels, selection state, focus visibility/order, no traps or obscured focused controls, contrast, text reflow, and no horizontal overflow/clipping. Include longer replacement content. Save screenshots and an accessibility checklist; Lighthouse alone is insufficient. |
| B3 | MR-02 AC5, AC6 | Missing, malformed, invalid, incomplete, or unsupported brand locks reject production. An isolated fixture with a recorded choice and its ADR selects exactly that direction/copy. For A/B/C disposable verification builds, inspect all HTML/CSS/JS and other shipped assets: only selected tokens/copy, no toolbar, switch/persistence code, or alternate copy payloads. Remove temporary fixtures and leave the real lock unchanged; fixture approval is never Erik approval. |
| C1 | MR-03 AC1, AC2 | Inspect representative photo/writeup: readable Draft text, visible stock/development label, no invented endorsement/result. Every substitute has a record linked from `PLACEHOLDERS.md` with source, license/permission, owner, and unblock condition. Adding a substitute adds its record without closing existing entries. |
| C2 | MR-03 AC3, AC4, AC5 | Change only photo, alt text, and writeup content records to a differently proportioned image and longer text; diff confirms layouts/components unchanged. Verify readable mobile output, meaningful alt text, undistorted images, explicit dimensions and appropriate loading. With approved Miller material, verify provenance/Erik approval before removing labels and closing only its matching entry. Without it, use licensed labeled substitutes, leave entries Open, and report the real-content branch unverified. |
| C3 | MR-03 AC6; MR-02 AC5 | In isolated fixtures, unresolved included stock/Draft content or any Open root placeholder rejects production readiness/build. An otherwise eligible fixture excludes all development media and invented writeups from the complete artifact tree, including unreferenced copied files. Bypass/hide-only attempts must fail. Keep actual placeholders and brand approval unchanged; fixture success is not production readiness. |
| J1 | MR-04 AC1, AC2, AC6 | Capture official API/upload references with retrieval date/version and intended permissions/boundary. After explicit synthetic-operation authorization, create one customer and linked job, write representative required custom fields, and upload a nonprivate licensed test image through the official flow. Retrieve and compare links/field values and downloaded photo identity (checksum or equivalent); record returned-record checks, observed limits, sanitized evidence, gaps, and cleanup results. Documentation-only success cannot satisfy live checks. |
| J2 | MR-04 AC3, AC6 | In the same approved boundary, investigate a repeated synthetic submission, customer-success/job-failure, job-success/photo-failure, and transient API error. Observe safe cases where supported; use local external-boundary doubles for otherwise unsafe faults and label those simulated. Record how to detect incomplete/duplicate records, supported recovery actions, uncertainty, and cleanup. Do not claim durable retry, idempotency, or lead preservation is implemented. |
| J3 | MR-04 amended AC4, AC5, AC6 | Record the native JobTread booking gap as Unsupported from Matt's confirmation. Assess the selected Google Appointment Schedule using the actual Workspace entitlement and owner settings for availability, phone/in-person mode, buffers, timezone, reminders and cancel/reschedule. Determine the supported JobTread appointment-association path; until verified, keep that behavior Unverified and block production commitments. No native-booking testing or account setup. |

## Quality protocols

These are **Required** story bars. No competitor comparison or discretionary gauntlet round is needed.

- **Mobile performance:** Pin MR-01 constraints, the branding kit's 2026-10-01 edition, candidate revision, `package-lock.json`, and `lighthouserc.cjs`. Run existing LHCI three-run mobile protocol on the generated review `/` page; retain individual reports and LHCI assertion results. Record Chrome/Lighthouse versions, OS, viewport, throttling, and aggregation settings. Performance, accessibility, and best-practices scores must each be at least 90; LCP must be strictly below 2,500ms. The current config allows equality at 2,500ms: inspect results against the story's strict threshold, and reconcile enforcement in technical planning.
- **Variation coverage:** Existing static LHCI starts at A. Measure B/C and the replacement-media state with the same mobile settings and three-run protocol, using isolated fixtures or browser state that visibly selects the tested variant. Record the state and inputs. Apply the same thresholds; retain evidence for each. Technical planning selects the invocation without adding a public application interface. SEO remains warning-only for noindex previews; production SEO is outside this batch.
- **Accessibility:** Pin WCAG 2.1 AA as named in MR-02, with the B2 protocol for applicable review-page criteria, manual keyboard checks, contrast measurements, labels, image alternatives, and reflow. Record applicable criteria and results; unresolved AA failures block conformance. Automated scores do not establish AA compliance.
- **Brand comparison:** Pin branding-kit sections 5, 10, and 12 as read on 2026-10-01, and record the tested artifact hashes/revision. Compare computed palette/type pairing and displayed words on the same page/viewports for A/B/C. Differences need correction or an explicit scope amendment; no final brand choice is inferred.

Missing Chrome, unreproducible settings, absent variant evidence, only screenshots for artifact isolation, or only local evidence for live behavior makes the corresponding result **unverified**, not passed. Local results do not prove remote CI or deployment quality.

## Booking requirements matrix

These rows define the external booking requirements and prerequisite assessment. Record the native homeowner-booking gap separately as **Unsupported**, sourced to Matt's confirmation. For Google Workspace Appointment Schedules, use **Verified**, **Unsupported**, or **Unverified**, with source/date, account boundary, evidence, limits and impact; separate official documentation, owner settings, live observations and Matt-confirmed facts. Google's general documentation does not prove Erik's account entitlements or JobTread association.

| Required capability | Verification focus |
|---|---|
| Public homeowner self-booking | Homeowner chooses an available consultation slot on the published Google booking page without internal scheduling access. |
| Appointment mode | The owner-configured page clearly offers phone or in-person arrangements; Google Meet is not used. If Erik wants homeowners to choose modes, verify and configure separate schedules/links. |
| Availability and buffers | Erik's actual Workspace plan/settings govern available calendars, scheduling window, buffers, and notice. Verify conflicts against the intended calendars. |
| Timezones | Homeowner and Erik see consistent appointment times; include a daylight-saving boundary. |
| Conflict prevention | Two attempts for one slot cannot produce conflicting confirmed appointments in the real schedule. |
| Confirmations and reminders | Verify which settings/entitlements are available in Erik's account, then test permitted synthetic delivery or mark Unverified. |
| Cancellation and rescheduling | Observe appointment/event updates and resulting availability in Erik's calendar and booking page. |
| Customer/job association | Retrieve the appointment and verify association to the intended synthetic JobTread records through a supported, separately approved path. |

Google's booking page and calendar event are the selected scheduling system; unresolved account entitlements or JobTread association still block corresponding production commitments. The provider selection does not waive downstream booking behavior checks.

## Data, environments, and CI

- Use synthetic names, non-deliverable contact values, unique run markers, representative custom fields, and a small licensed image containing no people, private property information, or location metadata. Use only specifically authorized test recipients for delivery checks. Never use live customers or private photos.
- Matt must approve the JobTread organization/test boundary, permission scope, exact writes, repeat/fault operations, notifications, and cleanup before mutation. Inventory created synthetic records; use supported removal/archive behavior, retrieve to verify cleanup, and report retained records or unsupported cleanup. No mutation proceeds with an unknown cleanup policy.
- Local tests remain deterministic through Node `node:test`; double only true external boundaries. Use vertical red-to-green cycles for implemented behavior. During later implementation, prove sensitivity for deployment guards, production exclusion, and secret/PII safeguards with a restored temporary mutation or equivalent negative control.
- GitHub CI retains `npm ci`, `npm run check`, and `npm run lighthouse`. For MR-01, Cloudflare builds and deploys independently of GitHub verification. Add approved guard scenarios to the existing Node suites; do not add JobTread credentials or live mutation to default/fork CI. Browser walkthroughs and authorized live capability checks produce separate evidence. No database, container service, new coverage threshold, or browser-test framework is selected.
- Record environment, revision plus any uncommitted changes, commands/exit codes, scenario result, evidence location, and limitations. Sanitize before retaining reports; do not save raw secret-bearing logs. Remote evidence includes CI run/job links and tested URLs; JobTread evidence includes only permitted sanitized identifiers/outcomes.

## Known gaps and execution prerequisites

Inspection baseline: HEAD `a9a80faf84a720582f56a6b56069a1796fe32205` with existing uncommitted product/brand/operations/placeholder documents. No execution result is claimed by this plan.

The current scaffold supplies health tests, token/control isolation checks, and mobile LHCI. It does not yet supply content records, content/placeholder build guards, full alternate-copy/asset exclusion checks, or a JobTread verification harness. Those are planning/implementation gaps, not passing evidence. Real approved Miller content, restricted remote access, and authorized live operations may delay specific scenario branches; keep them unverified until executed.

At the QA inspection baseline, [0001](../../architecture/decisions/0001-bootstrap-foundation.md) was Proposed and the accepted source ADR was missing. Update, 2026-10-01: the [accepted source frontend ADR](../../architecture/decisions/ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md) is now supplied. MR-01 technical planning proposes a dated reconciliation in 0001; this QA plan accepts no new ADR and selects no integration/provider design.

**Open QA decisions**: None. Concrete environment values, supported JobTread operations, cleanup policy, and Erik's production approvals must be settled in the relevant technical contract or execution gate. Their absence cannot be treated as successful verification or authorize mutation.

## Approval gate

Matt approved the proposed seams, Required quality-bar protocols/classification, unit/integration/browser and live scenarios, test data/cleanup controls, and CI expectations on 2026-10-01. Approval permits technical planning; it does not authorize implementation or external actions. Developer specs, work packages, and required ADRs need separate human approval before implementation.

## Approved remaining-story QA amendment (2026-10-02)

**Approval recorded**: Matt directed completion through technical specs for all remaining stories and assigned sequential local keys MR-06 onward. This amendment supplies the QA gate for MR-05–MR-13. Existing MR-01–MR-04 scenarios and their evidence remain unchanged. Approval of this plan authorizes technical planning only, not implementation, account configuration, external posting, deployment, or DNS changes.

**Additional inputs**: [MR-05](../../product/stories/website-lead-qualification/mr-05.md), [MR-06](../../product/stories/website-lead-qualification/mr-06.md), [MR-07](../../product/stories/website-lead-qualification/mr-07.md), [MR-08](../../product/stories/website-lead-qualification/mr-08.md), [MR-09](../../product/stories/website-lead-qualification/mr-09.md), [MR-10](../../product/stories/website-lead-qualification/mr-10.md), [MR-11](../../product/stories/website-lead-qualification/mr-11.md), [MR-12](../../product/stories/website-lead-qualification/mr-12.md), [MR-13](../../product/stories/website-lead-qualification/mr-13.md), and the approved [MR-01–MR-04 fix spec](../../specs/website-lead-qualification/mr-01-through-mr-04.fix.spec.md).

### Risks and test boundaries

The remaining highest risks are lost or duplicated lead data, unsafe photo/PII handling, incorrect fit decisions, double-booking or broken JobTread association, accidental publication of unapproved content/reviews, misleading search claims, and release without evidence. Use existing repository boundaries for Astro pages, Content Layer records, Worker `fetch`, Node `node:test`, build/production guards, and local Lighthouse. Use manual browser checks for accessibility and mobile authoring. External JobTread, Google Workspace, review, GBP, and social behavior must be exercised only in separately approved synthetic/test boundaries. A mock or document review is not live provider evidence.

No browser automation framework, analytics provider, database, CMS provider, notification provider, or new public test endpoint is approved by this plan. The specs must settle testable contracts and name provider/retention prerequisites without claiming their behavior is verified. Do not collect real lead PII in fixtures or routine test logs.

### Scenarios and traceability

| ID | Story / AC coverage | Scenario and evidence |
|---|---|---|
| I1 | MR-05 AC1–AC3 | Submit valid and malformed general inquiries through the approved public boundary. Verify accepted fields, JobTread general-inquiry identification, accessible validation and confirmation; no external dispatch for invalid data. Use deterministic Worker tests and authorized synthetic live evidence separately. |
| I2 | MR-05 AC4–AC6; MR-07 AC5–AC6 | Repeat the same submission; simulate JobTread outage and partial customer/location/job/photo outcomes. Verify idempotent/recovery status, no lost lead, operator reconciliation, secret/PII isolation and photo lifecycle. Record retention expiry and external evidence kind. |
| W1 | MR-06 AC1–AC3, AC5 | Visit every required service, process, portfolio, contact and service-area route. Compare claims to approved sources or the MR-06 local-copy amendment; Draft/test and substitute content stays labeled and is blocked from production. Confirm missing verified proof is marked pending and no substitute is represented as Miller work. |
| W2 | MR-06 AC4–AC5; MR-07 AC6 | Manual keyboard, screen-reader, contrast, focus, error, touch and reflow checks on representative short/long pages and wizard states at 320px, 390px and desktop 200% zoom. Preserve evidence for WCAG 2.1 AA; automated scores alone do not pass. |
| W3 | MR-06 AC5; MR-07 AC1–AC5 | Run three-run mobile Lighthouse for required representative site and wizard states under the pinned existing config; performance/accessibility/best-practices ≥90 and LCP strictly <2,500ms. SEO remains warning-only on noindex previews. State, revision, inputs, reports and settings are recorded; nonmatching evidence is Unverified. |
| Q1 | MR-07 AC1–AC4 | Exercise every wizard step, clear/resume local progress, validation and consent/data notices, field boundaries, approved scoring bands, low-fit/qualified branches, paid-design copy and booking handoff. Erik's actual rules/copy are required test data, not inferred fixtures. |
| B1 | MR-08 AC1–AC6 | With a separately approved Google Workspace test schedule, verify phone/in-person page configuration, availability/buffers, timezone/DST, conflicting attempts, configured confirmation/reminder, cancel/reschedule and matching JobTread record. Docs-only evidence leaves account behavior Unverified. No Google Meet. |
| P1 | MR-09 AC1–AC5 | Mobile authoring timed walkthrough under 15 minutes; save content to an access-restricted Cloudflare preview branch, inspect the exact rendered preview, then use Erik's authenticated Publish action. Verify the same revision/hash is committed directly to the content allowlist on main with no PR, triggering the automatic build/deploy path. Test edit/reapproval, withdrawal, failed build, provenance and production guards; confirm unsigned content never publishes. |
| R1 | MR-10 AC1–AC6 | In an isolated test workflow, complete synthetic job, observe one survey/review request, pause/reconcile failure, and verify hold/approve/edit/withdraw publication states. Confirm neutral request treatment and no incentive/sentiment filtering. Live sends need separately approved recipients. |
| S1 | MR-11 AC1–AC5 | Validate business/service/review/FAQ markup against rendered visible content; inspect sitemap, canonical, robots/noindex by environment, approved old-URL redirects, profile consistency, baseline provenance and measurement privacy. No production SEO/analytics is enabled by QA approval. |
| C1 | MR-12 AC1–AC5 | Review project-type templates and case-study format; timed process under 30 minutes excluding waiting; separate ready drafts from approved/published posts. A real GBP/social pass requires approved source content and separate authorization for each external publication. |
| H1 | MR-13 AC1–AC6 | Walk through each runbook with Erik/BIS; verify checklist traceability to approved evidence, placeholder/brand/content gates, owners, observability, rollback trigger/actions, sanitized live inquiry evidence after separate release authorization, and agreed testimonial evidence. |

### Data, environments, and completion rules

- Synthetic JobTread, booking, review, upload and contact data only; use non-deliverable addresses unless exact recipients are approved. Inventory every external artifact and confirm cleanup/retention before writing. Unknown cleanup or notifications block the relevant live scenario.
- Store only synthetic fixtures and sanitized outcomes in the repository. No real leads, customer photos, credentials, raw external responses, signed URLs, or PII-bearing analytics events in logs or test reports.
- Keep deployment/publication/production checks separate from local tests. A successful local Worker double, rendered page, or schema validator does not prove account capabilities, remote CI, live URL behavior, or user acceptance.
- Quality protocols inherited from the foundation plan apply to site and wizard states. Re-run affected states when content, fonts, images, CSS, JS, or rendered markup changes. No additional threshold or coverage percentage is introduced.
- An acceptance criterion with missing owner inputs is blocked until those inputs are supplied. Do not weaken the scenario, replace unknown business values with invented ones, or call simulated evidence live.

**Remaining-story gate**: Complete. The user directly requested the technical specs after stories and assigned the sequential keys. Proceed to technical planning for MR-05–MR-13. Specs, packages and any Proposed ADRs remain Draft for separate human approval.

**MR-09 QA amendment (2026-10-02)**: Matt directs owner-only self-approval and no PR process for portfolio content. P1 now requires an access-restricted rendered preview and Erik's authenticated Publish action, with revision/hash equality, direct content-only main commit, and automatic Cloudflare build/deployment evidence. Engineering code changes and their ordinary CI/review path are unchanged. This does not authorize repository/Cloudflare configuration, first production launch, or DNS changes.
