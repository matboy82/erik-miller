# MR-01–MR-04: Sequential fix work packages

**Status**: Approved
**Approval recorded**: Matt, 2026-10-02 — “approved.” Includes this manifest and the fix spec.
**Work items**: MR-01, MR-02, MR-03, MR-04; no new story key
**Created**: 2026-10-02 (America/Denver)
**Contract**: [Supplementary fix spec](mr-01-through-mr-04.fix.spec.md)
**Approval set**: This manifest and the fix spec. Original approved contracts remain governing.

Technical approval is recorded. Execute selected packages sequentially through `$sdd-implement`. A blocked external/asset prerequisite is recorded explicitly; independent later local work may proceed. No package grants commit, push, deployment, account or DNS authority.

## MR-04-F1 — Correct guidance and approval-date validation

**Outcome / findings**: Resolve MR04-R2 using the current Google Workspace Appointment Schedule direction and the MR-04 date nit; reconcile MR-01/MR-02 metadata nits.

**Dependencies**: Approval of the fix spec/manifest; existing Accepted ADRs.

**Allowed scope**: `scripts/jobtread-verification.mjs`, its existing test file, Cloudflare setup guide's scheduler guidance, dated current-state notes in affected MR-01/MR-02 approved artifacts, and the corresponding verification reports. No change to public probe shape, transport, live-action gates or historical decision text.

**Done / verification**: Date boundary tests fail before the fix and pass afterward, including zero credential/dispatch calls for invalid dates. Current guide conforms to Accepted 0005 and 0007 and records the Google Appointment Schedule direction plus remaining association/entitlement prerequisites. Focused probe suite, `npm run check`, local links and whitespace pass with actual output recorded. New defects require expanded remediation approval.

## MR-02-F1 — Browser comparison and accessibility evidence

**Outcome / findings**: Resolve MR02-R1 and MR03-R1 through one coordinated B1/B2/C2 evidence pass, with separate story traceability.

**Dependencies**: Final local source; available browser and existing licensed rehearsal content.

**Allowed scope**: Existing local review surface, disposable content/variant fixtures, screenshots/checklists and MR-02/MR-03 verification reports. Exercise every specified interaction/storage branch and computed palette/font pair; inspect normal/long-content states across A/B/C at required widths/zoom. No new browser dependency or public test interface.

**Done / verification**: Complete manual AA/interaction/reflow results and screenshots match the final candidate. Measurements remain tied to unchanged artifacts or affected states are remeasured under the approved protocol. Missing browser proof stays Unverified. Unexpected UI defects are findings, not implicit fix authorization.

## MR-01-F1 — Fresh checkout and remote deployment evidence

**Outcome / findings**: Resolve MR01-R2 locally and MR01-R1 where external prerequisites permit.

**Dependencies**: Final candidate; Node/Chrome. Remote work additionally requires confirmed resources/access and specific authorization for necessary mutations/failure tests.

**Allowed scope**: Isolated checkout, existing build/check/Lighthouse commands, authorized test resources, sanitized MR-01 verification evidence, setup/current-state documentation and justified INFRA status updates. Preserve the user's checkout.

**Done / verification**: F1 exact-candidate install/check/measurement logs plus the full F2–F4 main/preview/failure/configuration/live HTTP matrix. GitHub and Cloudflare results are recorded separately. No inferred deployment, invented URL or premature placeholder closure.

## MR-03-F1 — Real Miller replacement branch

**Outcome / finding**: Resolve MR03-R2 when approved real assets exist.

**Dependencies**: Actual Miller image/copy provenance and Erik's exact sign-off; browser checks from MR-02-F1.

**Allowed scope**: Project content records/assets, exact-content approval/substitute evidence, corresponding verification report and matching placeholder entries. Preserve archived stock provenance. No layout edits, invented sign-off or unrelated closure.

**Done / verification**: Real-content C2 confirms content-only replacement, exact image/copy approval, derived label removal and matching closure. Repeat affected quality checks when rendered inputs change. If assets/sign-off are unavailable, retain Open entries and record the branch Unverified.

## MR-04-F2 — Authorized live capability observations

**Outcome / finding**: Resolve MR04-R1.

**Dependencies**: MR-04-F1; confirmed private plan and Matt's explicit exact-operation approval, permissions, side effects and known cleanup/retention policy.

**Allowed scope**: Only approved synthetic J1/J2 operations and cleanup/retention; protected private inventory; sanitized MR-04 report/runbook evidence. No native-booking tests, live customers, provider setup or application endpoints.

**Done / verification**: Independently retrieved links/fields and original-photo identity, bounded repeat/recovery results with evidence kinds, reconciled inventory and verified cleanup/approved retention. Stop/reconcile ambiguous results. Unavailable or unauthorized operations remain Unverified; no blind replay.

## MR-01–MR-04-FR — Separate review verdicts

**Outcome / findings**: Resolve MR01-R3, MR02-R2, MR03-R3 and MR04-R3; re-evaluate all other findings.

**Dependencies**: Available final correction/evidence set; approved remediation status persisted before re-review. Remaining prerequisites must be explicit in each packet.

**Allowed scope**: Per-story diff/changed-file/verification packets, separate fresh-session adversarial passes and current code re-review, existing story-keyed review records. One specialist at a time; no automatic fanout.

**Done / verification**: Both verdicts recorded under each original key without erasing prior findings or claiming same-session independence. Outstanding requirements produce Block rather than assumed acceptance. Any new remediation scope returns for approval. Human acceptance and release/deployment gates remain separate.

**Approval gate**: Complete, 2026-10-02. Next: `$sdd-implement` for selected packages. No Proposed ADR is needed for this scope; exact external-action approvals remain separate.
