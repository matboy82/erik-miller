# Website and lead qualification: foundation QA plan

**Status**: Approved
**Approval recorded**: Matt, 2026-10-01 — “approved”
**Owner**: Matt / BIS; Erik reviews brand and content
**Created**: 2026-10-01
**Scope**: Approved MR-01 through MR-04 only
**Inputs**: [Epic](../../product/epics/website-lead-qualification.md), [MR-01](../../product/stories/website-lead-qualification/mr-01.md), [MR-02](../../product/stories/website-lead-qualification/mr-02.md), [MR-03](../../product/stories/website-lead-qualification/mr-03.md), [MR-04](../../product/stories/website-lead-qualification/mr-04.md)
**Next gate**: `$sdd-tech-spec` prepares developer specs, work packages, and required ADRs for separate human approval.

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
| F2 | MR-01 AC2, AC4 | Exercise the workflow matrix: passing main automatically publishes Pages and Worker without an enable flag; failing verification never deploys; passing same-repository PR gets a distinct Pages preview; fork PR verifies with deployment job skipped and no deployment secrets. Capture run/event/job evidence and URLs. Use an authorized deliberate check failure; never print secrets to prove isolation. |
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
| J3 | MR-04 AC4, AC5, AC6 | Complete the native-booking matrix below using official evidence and permitted observations. Recommend native only when every required capability is verified; otherwise list gaps and propose an external booking page, with direct-integration feasibility under the no-Zapier/Make constraint. Report unresolved prerequisites and block affected dependent commitments; Matt/Erik select the provider later. |

## Quality protocols

These are **Required** story bars. No competitor comparison or discretionary gauntlet round is needed.

- **Mobile performance:** Pin MR-01 constraints, the branding kit's 2026-10-01 edition, candidate revision, `package-lock.json`, and `lighthouserc.cjs`. Run existing LHCI three-run mobile protocol on the generated review `/` page; retain individual reports and LHCI assertion results. Record Chrome/Lighthouse versions, OS, viewport, throttling, and aggregation settings. Performance, accessibility, and best-practices scores must each be at least 90; LCP must be strictly below 2,500ms. The current config allows equality at 2,500ms: inspect results against the story's strict threshold, and reconcile enforcement in technical planning.
- **Variation coverage:** Existing static LHCI starts at A. Measure B/C and the replacement-media state with the same mobile settings and three-run protocol, using isolated fixtures or browser state that visibly selects the tested variant. Record the state and inputs. Apply the same thresholds; retain evidence for each. Technical planning selects the invocation without adding a public application interface. SEO remains warning-only for noindex previews; production SEO is outside this batch.
- **Accessibility:** Pin WCAG 2.1 AA as named in MR-02, with the B2 protocol for applicable review-page criteria, manual keyboard checks, contrast measurements, labels, image alternatives, and reflow. Record applicable criteria and results; unresolved AA failures block conformance. Automated scores do not establish AA compliance.
- **Brand comparison:** Pin branding-kit sections 5, 10, and 12 as read on 2026-10-01, and record the tested artifact hashes/revision. Compare computed palette/type pairing and displayed words on the same page/viewports for A/B/C. Differences need correction or an explicit scope amendment; no final brand choice is inferred.

Missing Chrome, unreproducible settings, absent variant evidence, only screenshots for artifact isolation, or only local evidence for live behavior makes the corresponding result **unverified**, not passed. Local results do not prove remote CI or deployment quality.

## JobTread booking matrix

J3 must report each row as **Verified**, **Unsupported**, or **Unverified**, with source/date, observation boundary, evidence, limits, and impact. Documentation and observations remain separately identified. A marketing claim or missing documentation does not establish support or lack of support.

| Required capability | Verification focus |
|---|---|
| Public homeowner self-booking | Homeowner chooses an available consultation slot without internal project-scheduling access. |
| Availability and buffers | Availability rules and before/after buffers govern offered slots. |
| Timezones | Homeowner and Erik see consistent appointment times; include a daylight-saving boundary where supported. |
| Conflict prevention | Two attempts for one slot cannot produce conflicting confirmed appointments. |
| Confirmations and reminders | Identify supported delivery mechanisms and verify permitted synthetic delivery or mark unverified. |
| Cancellation and rescheduling | Observe appointment/state updates and resulting availability. |
| Customer/job association | Retrieve the appointment and verify its association to the intended synthetic records. |

Calendar sync and project task scheduling alone satisfy none of the public self-booking claims. Unsupported/unverified capability is a valid finding for this verification story, but blocks the corresponding downstream feature until an approved resolution exists.

## Data, environments, and CI

- Use synthetic names, non-deliverable contact values, unique run markers, representative custom fields, and a small licensed image containing no people, private property information, or location metadata. Use only specifically authorized test recipients for delivery checks. Never use live customers or private photos.
- Matt must approve the JobTread organization/test boundary, permission scope, exact writes, repeat/fault operations, notifications, and cleanup before mutation. Inventory created synthetic records; use supported removal/archive behavior, retrieve to verify cleanup, and report retained records or unsupported cleanup. No mutation proceeds with an unknown cleanup policy.
- Local tests remain deterministic through Node `node:test`; double only true external boundaries. Use vertical red-to-green cycles for implemented behavior. During later implementation, prove sensitivity for deployment guards, production exclusion, and secret/PII safeguards with a restored temporary mutation or equivalent negative control.
- CI retains `npm ci`, `npm run check`, and `npm run lighthouse` before deployment. Add approved guard scenarios to the existing Node suites; do not add JobTread credentials or live mutation to default/fork CI. Browser walkthroughs and authorized live capability checks produce separate evidence. No database, container service, new coverage threshold, or browser-test framework is selected.
- Record environment, revision plus any uncommitted changes, commands/exit codes, scenario result, evidence location, and limitations. Sanitize before retaining reports; do not save raw secret-bearing logs. Remote evidence includes CI run/job links and tested URLs; JobTread evidence includes only permitted sanitized identifiers/outcomes.

## Known gaps and execution prerequisites

Inspection baseline: HEAD `a9a80faf84a720582f56a6b56069a1796fe32205` with existing uncommitted product/brand/operations/placeholder documents. No execution result is claimed by this plan.

The current scaffold supplies health tests, token/control isolation checks, and mobile LHCI. It does not yet supply content records, content/placeholder build guards, full alternate-copy/asset exclusion checks, or a JobTread verification harness. Those are planning/implementation gaps, not passing evidence. Real approved Miller content, restricted remote access, and authorized live operations may delay specific scenario branches; keep them unverified until executed.

At the QA inspection baseline, [0001](../../architecture/decisions/0001-bootstrap-foundation.md) was Proposed and the accepted source ADR was missing. Update, 2026-10-01: the [accepted source frontend ADR](../../architecture/decisions/ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md) is now supplied. MR-01 technical planning proposes a dated reconciliation in 0001; this QA plan accepts no new ADR and selects no integration/provider design.

**Open QA decisions**: None. Concrete environment values, supported JobTread operations, cleanup policy, and Erik's production approvals must be settled in the relevant technical contract or execution gate. Their absence cannot be treated as successful verification or authorize mutation.

## Approval gate

Matt approved the proposed seams, Required quality-bar protocols/classification, unit/integration/browser and live scenarios, test data/cleanup controls, and CI expectations on 2026-10-01. Approval permits technical planning; it does not authorize implementation or external actions. Developer specs, work packages, and required ADRs need separate human approval before implementation.
