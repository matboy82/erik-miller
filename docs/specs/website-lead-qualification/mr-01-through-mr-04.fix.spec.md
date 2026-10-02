# MR-01–MR-04: Review fixes and missing evidence

**Status**: Approved
**Approval recorded**: Matt, 2026-10-02 — “approved.” Includes this fix spec and its work-package manifest. Booking-guidance target amended later on 2026-10-02 to Google Workspace Appointment Schedules; prior Calendly wording is superseded.
**Work items**: MR-01, MR-02, MR-03, MR-04; no new story key
**Created**: 2026-10-02 (America/Denver)
**Baseline reviewed**: `e0741153f63966fd86ada9d940fc75ee0dd628e4`
**Inputs**: [MR-01 review](mr-01.review.md), [MR-02 review](mr-02.review.md), [MR-03 review](mr-03.review.md), [MR-04 review](mr-04.review.md), their linked Approved stories/specs/manifests, and the Approved [QA plan](../../qa/test-plans/website-lead-qualification.testplan.md).
**Approval set**: This supplementary fix spec and its [sequential work packages](mr-01-through-mr-04.fix.work-packages.md). Existing approved contracts remain governing.

## Outcome and scope

Resolve the complete review finding set so each story can receive a new evidence-based verdict. Most blockers are missing verification or external prerequisites, rather than established application defects. Implement the identified documentation correction and small approval-date safeguard, collect the required evidence where prerequisites permit, and obtain separate adversarial reviews.

This spec adds no acceptance criteria, provider, deployment architecture, or new product feature. Preserve dependency pins, noindex, the health-only Worker, brand/content gates, and user-owned changes. Do not infer approval of implementation, external actions, Erik's brand/content choice, commits, pushes, production deployment, account setup, or DNS from this drafting request.

## Finding-to-resolution contract

| Finding | Required resolution | Completion evidence |
|---|---|---|
| MR01-R1 | Complete current-candidate F2–F4: independent Cloudflare main app builds, trusted Pages preview, app-build failure preventing publication, preview restrictions/main-only Worker configuration, actual URLs and live noindex/health checks, and configuration/secret-isolation evidence | Sanitized run/revision/URL/configuration and HTTP records in MR-01 verification; close INFRA entries only when their exact unblock conditions pass |
| MR01-R2 | Run F1 from an isolated fresh checkout of the final candidate: Node 24+, `npm ci`, `npm run check`, `npm run lighthouse` | Exact revision/source snapshot, versions, command logs/exit codes, three reports and assertion results; never reset the user's checkout |
| MR02-R1 | Complete real-browser B1/B2 for all visual/copy/tagline transitions, reset/persistence/fallback/legacy/unavailable-storage branches, computed palette/font comparison, and keyboard/touch/contrast/focus/reflow | Current-candidate checklist, computed styles, selection/storage results and screenshots at 320px, 390px and desktop 200% zoom across A/B/C, including the longest tagline |
| MR03-R1 | Complete C2/B2 on normal and portrait/long-writeup content across A/B/C; verify meaningful alt text, dimensions, loading, natural aspect ratio and reflow | Record-only rehearsal diff, manual keyboard/touch/contrast/focus checks and mobile/zoom screenshots; layout/component edits are unnecessary for the content swap |
| MR03-R2 | Once real Miller assets and actual Erik sign-off exist, execute the real-content C2 branch | Exact image/copy provenance and approval, rendered label removal, matching substitute verification/closure only; retain substitute history and unrelated Open entries |
| MR04-R1 | Confirm the private operation plan and exact live authorization, then execute J1, the approved J2 repeat/recovery observations, and cleanup or explicitly approved retention | Retrieved customer/location/job links and field values, original-photo identity, duplicate/partial/transient findings with evidence kinds, private inventory reconciliation and sanitized AC traceability |
| MR04-R2 | Replace current native-first scheduler guidance in `docs/operations/cloudflare-test.md` with the owner-confirmed JobTread gap and selected Google Workspace Appointment Schedule direction (phone/in-person, no web conference) | Guide links Accepted 0005/0007 and MR-04 evidence, names remaining Workspace entitlement and JobTread association prerequisites, and grants no booking setup authority |
| MR01-R3, MR02-R2, MR03-R3, MR04-R3 | Obtain a separate fresh-session adversarial verdict for each story, followed by code re-review of the final evidence/change set | Both verdicts recorded in each existing story-keyed review artifact; no same-session independence claim or presumed exception |
| MR-01/MR-02 metadata nits | Reconcile stale next-phase/current-state guidance in the affected approved artifacts | Dated current-state notes distinguish implementation present, evidence incomplete, and review blocked; preserve original approval/history and historical amendments |
| MR-04 approval-date nit | Make `validPlan` reject impossible ISO calendar dates as well as malformed date strings | Probe-boundary tests show refusal before credential access/network dispatch, while a valid approved plan remains usable |

Every numbered blocker and non-blocking improvement from the four reviews is included. Missing real assets or external authorization leaves its row Unverified/Blocked; it does not permit inventing evidence or weakening the approved outcome.

## Implementation and compatibility

Change only the probe's approval-date validation and its focused tests, the contradictory current scheduler guidance, and stale current-state metadata. Require a real `YYYY-MM-DD` calendar date without normalization of invalid days/months; preserve the existing plan interface, live opt-in, credential destination, schema pin, budgets, private inventory and sanitized results. Recorded plan metadata remains an operator control, not authentication.

Other rows use existing approved seams and tooling. Do not add a browser framework, public variant endpoint, intake route, CRM replica, retry store, notification service or scheduling integration. If verification reveals another code defect, enumerate it and return to remediation approval before implementing an expanded scope.

Affected consumers are the direct probe operator, current operational/planning readers, existing build/measurement commands, reviewers, and the approved test-site/synthetic boundaries. The date guard deliberately rejects previously accepted impossible dates; valid plans retain existing behavior. Local correction impact is Low; overall evidence/review scope remains Medium for MR-01–03 and High for MR-04 external effects.

## Verification and evidence rules

- Use existing `node:test` through `runProbe` for malformed dates, impossible dates, valid dates and leap-day boundaries. Expected results must be independent of the date-validation implementation. Verify invalid plans cause zero credential/network calls.
- Run `node --test scripts/test/jobtread-verification.test.mjs` after the date change, then `npm run check` for the final local implementation. Check documentation links and whitespace. Record actual output and any filesystem-access limitation; no success by assumption.
- Keep the QA plan's **Required** bars: kit edition 2026-10-01; WCAG 2.1 AA with B1/B2/C2 manual protocols; three mobile runs per required state using pinned lockfile/LHCI configuration and identical settings; optimistic category scores ≥90 and LCP strictly <2500ms. SEO stays warning-only for deliberate noindex.
- Reuse retained measurements only with documented final-source/artifact equivalence. If a rendered input, style, script, font or media changes, rerun affected A/B/C normal/replacement measurements; absence of matching evidence is Unverifiable. F1 still needs its actual fresh-checkout measurement.
- Evidence names the final candidate revision plus any uncommitted changes, environment, boundary, scenario, command/exit code and location. Keep credentials, private identifiers, customer PII, raw sensitive responses and signed URLs out of tracked evidence. Distinguish live observations, documentation, owner-confirmed facts and simulations.
- Append corrections/current results to `docs/project/mr-01-verification.md` through `mr-04-verification.md`; preserve historical results and review findings. Preparing a packet or passing local tests cannot close live/manual/adversarial rows.

## External prerequisites and review handoff

Matt must supply/confirm the intended Cloudflare resources, configuration access, actual deployment URLs, and authorization for any needed configuration, push/deployment or deliberate failure-test action. Read-only inspection of existing resources can collect evidence; this spec grants no remote mutation authority.

For MR-04, populate the private plan with organization/boundary, field IDs/types/sample values, transfer origins, exact operations/counts, permission scope, notification/workflow side effects, request limits and cleanup/orphan-retention policy. Obtain Matt's explicit approval of that exact plan before any creation, upload, repeat, fault or cleanup action. Stop after an ambiguous write and reconcile; no automatic replay.

Erik supplies real Miller content and exact sign-off for MR03-R2. Stock rehearsal remains allowed and visibly Draft while that branch is blocked. Actual brand selection and provider account provisioning remain outside this fix scope.

Prepare one packet per existing MR key containing repository instructions, approved contracts including this remediation, raw diff/changed files, tested revision and actual verification output. Exclude implementation conversation/reasoning from the fresh-session adversarial input. Persist returned findings and both verdicts in `mr-01.review.md` through `mr-04.review.md`, preserving earlier findings. Do not approve unrelated drafts or turn a verdict into human acceptance.

## ADRs, rollout and completion

Existing Accepted frontend ADR and 0001–0005 govern the work. **New ADR not required**: date validation and current-guidance correction enforce existing decisions; evidence collection selects no new durable boundary. Preserve dated decision history. A new provider, hosting/security model, or changed approved policy returns to technical planning and its ADR gate.

Rollout is local corrections and evidence delivery after approval. Restore prior source if a correction regresses behavior; preserve diagnostic evidence. External cleanup/redeployment follows only its separately approved plan, and reverting local tooling never removes remote records.

Done requires each finding's completion evidence and code/adversarial verdicts for its story. A completed local package with unavailable live/assets/browser prerequisites is partial remediation, not complete story acceptance. Release planning and deployment remain separate gates.

**Open design questions**: None. Named access, assets, exact live plan and fresh-session review are execution prerequisites with explicit stop conditions, not assumed approvals.

**Approval gate**: Complete, 2026-10-02. Next: `$sdd-implement` for selected packages in the approved manifest. The four Block verdicts remain in force until re-review; approval of this local scope does not authorize external mutations.
