# Local bootstrap - 2026-10-01

The user's request authorizes local project initialization and Claude-to-Codex skill conversion. This is not a completed WS-0 milestone or approval of later workstreams.

## Sources and scope

Exact byte copies of both supplied documents are under `docs/product/briefs` and `docs/brand`. Draft status/open decisions are unchanged. Embedded account/deploy instructions are reference material, not independent authorization. The separately referenced locked stack ADR was not attached; retrieve it before formal technical planning/production readiness.

Current deployment amendment (2026-10-01): Matt requested removal of the enable flag. Passing main pushes and same-repository PRs now deploy automatically after verification when the workflow is pushed and Cloudflare configuration is supplied. See [0002 amendment](../architecture/decisions/0002-test-deployment-isolation.md). The original bootstrap inventory below describes the earlier opt-in scaffold.

Current hosting amendment (2026-10-01): Cloudflare Git integration now owns separate Pages and Worker publication; GitHub Actions verifies only. Use build:web and build:worker from the repository root. This supersedes the earlier flag-removal/current-upload note above. No remote deployment is claimed.

Delivered locally: npm monorepo; Astro 7.3.5 static review page + React integration; TypeScript 6.0.3 supported by lint tooling; Node 24+; self-hosted fonts; A/B/C draft theme/copy toolbar; health Worker; CI and opt-in test deployment configuration; placeholder register and runbooks; 29 native Codex skills, shared contracts, and explicit rule references. Original Claude sources are preserved.

## Remaining milestone evidence

WS-0 still needs formal approved planning and external proof: remote CI, persistent test URL, live Worker, PR previews, secret-store verification, reviewed cutover runbook. No later intake/wizard/scheduler/CRM/CMS scope is implemented.

See `docs/project/bootstrap-verification.md` for actual check results. Local checks do not replace independent review, Erik's design approval, or release authorization.

## MR-01 current state — 2026-10-01

The [accepted source frontend ADR](../architecture/decisions/ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md) is now supplied. Matt approved the [MR-01 contract](../specs/website-lead-qualification/mr-01.spec.md), [0001 reconciliation](../architecture/decisions/0001-bootstrap-foundation.md), and [0002 test deployment decision](../architecture/decisions/0002-test-deployment-isolation.md). Earlier missing-source statements describe the original bootstrap baseline.

The Lighthouse command keeps three mobile runs and explicit optimistic aggregation, with a strict report gate rejecting LCP equality at 2,500ms. Stack/dependency pins and the health contract remain unchanged. The test Worker does not select production intake hosting. See [MR-01 evidence](mr-01-verification.md) for local results and outstanding remote proof; this dated update does not mark WS-0 complete.

## MR-02 current state - 2026-10-01

Matt approved the [MR-02 spec](../specs/website-lead-qualification/mr-02.spec.md), [complete package manifest](../specs/website-lead-qualification/mr-02.work-packages.md), and [ADR 0003](../architecture/decisions/0003-brand-selection-and-build-isolation.md). Local comparison now separates visual direction, hero/process copy, and stable tagline choices. Controls remain Draft and preserve recognized preferences; the toolbar is in document flow.

Production entry points validate a versioned lock against the exact choice and linked Erik sign-off in an Accepted brand-choice ADR, then verify the complete output tree. Disposable synthetic builds test A/B/C and independent copy/tagline selection without changing real approval. Fonts are selected inline self-hosted WOFF2 assets. No real brand lock, choice ADR, final logo, deployment, or placeholder closure is created.

The [brand-review runbook](../operations/brand-review.md) documents controls, recording a later real choice, and the all-direction mobile command. [MR-02 evidence](mr-02-verification.md) separates measured local results from missing manual/remote/review evidence. Earlier inventory describes the original bootstrap; this update does not mark WS-0 or MR-02 complete.

## MR-03 current state — 2026-10-02

Matt approved the [MR-03 spec](../specs/website-lead-qualification/mr-03.spec.md), [complete manifest](../specs/website-lead-qualification/mr-03.work-packages.md) and Accepted [0004](../architecture/decisions/0004-project-content-eligibility.md), then selected all packages. The review home page now reads a Zod-validated Content Layer project record with local licensed stock photography, visible development/Draft notices and source/permission records linked from the root register.

Production entries validate exact-content approval and all root placeholder statuses. Source-derived media hashes extend complete output inspection; disposable brand fixtures use geometric media and synthetic content evidence without changing real approvals. The [content runbook](../operations/project-content.md) explains record-only replacement, renewed approval and matching-entry closure. [MR-03 evidence](mr-03-verification.md) distinguishes local checks from missing real Miller assets, manual/browser, remote and independent-review evidence. No deployment or placeholder closure is performed.

## MR-04 current state — 2026-10-02

Matt approved the MR-04 contract and selected all packages. Local Node tooling now validates an operation plan, compares synthetic record links/fields/photo bytes, stops ambiguous writes without retries, and emits sanitized evidence. The [runbook](../operations/jobtread-capability-verification.md) provides the operation-plan draft and cleanup procedure. Read-only metadata access succeeded; no live records were created.

Matt confirms homeowner booking is unsupported in JobTread and selects Erik's Google Calendar Appointment Schedules (phone/in-person, no web conferences), superseding the initial Calendly choice. [MR-04 evidence](mr-04-verification.md) records earlier capability findings and the current Workspace/JobTread association prerequisites. MR-04 is NOT READY until the exact live-test plan is approved and executed with reconciled cleanup. CRM-01/SCHED-01 remain Open. Intake/booking implementation, Cloudflare secrets, independent review and deployment remain separate work.
