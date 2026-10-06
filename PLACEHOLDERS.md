# Placeholder register

Every Open entry blocks production. Close entries only after the unblock condition has observable evidence.

| ID | Placeholder | Owner | Unblock condition | Status |
|---|---|---|---|---|
| INFRA-01 | Cloudflare test project (account available, Matt confirms 2026-10-01) | Matt/BIS | Configure project and restricted CI secrets, authorize deploy, capture live Pages/Worker checks | Open |
| INFRA-02 | GitHub repository/CI (account available, Matt confirms 2026-10-01) | Matt/BIS | Confirm BIS org/repo, authorize push, configure test environment and branch protection, capture CI run | Open |
| BRAND-01 | Direction/tagline/logo | Erik/Matt | Record choice + ADR, complete final mark, create brand lock; see [review procedure](docs/operations/brand-review.md) and [MR-02 evidence](docs/project/mr-02-verification.md) | Open |
| CONTENT-01 | Photos/writeups (Erik collecting; stock/Draft development substitutes approved 2026-10-01) | Erik/Matt | Supply approved Miller project assets and provenance; replace all development stock/Draft content, recording each substitute's source/license when added | Open |
| CONTENT-SUB-01 | [Wide kitchen photo and Draft writeup](docs/content/substitutes/content-sub-01.md) | Erik/Matt | Approved Miller replacement, matching provenance/sign-off, and rendered verification | Open |
| CONTENT-SUB-02 | [Portrait kitchen photo and longer Draft writeup](docs/content/substitutes/content-sub-02.md) | Erik/Matt | Approved Miller replacement, matching provenance/sign-off, and rendered verification | Open |
| CONTENT-PAGES-01 | Erik-approved copy and verified facts for service, process, portfolio, contact, and area pages | Erik | Approve the exact page copy, confirm factual claims and service coverage, and record matching page-approval evidence | Open |
| DESIGN-CONTENT-02 | [Punch-list imagery and sample story](docs/content/design-imagery.md), bracketed facts and testimonial slots | Erik/Matt | Supply actual Miller photos, one documented story, reviews, and the items in [erik-facts.md](erik-facts.md) | Open |
| SEO-REDIRECTS-01 | Approved old WordPress URL map and profile destinations | Matt / Erik | Confirm each source URL and destination, then record the 301 map and verified profile links | Open |
| CRM-01 | JobTread Pave intake and task integration | Matt/BIS | Production contact/project/photo delivery and record readback; direct task create/deduplication/reschedule/cancel checks; live Worker readiness | Closed — verified 2026-10-04 and 2026-10-06; see [production review](docs/operations/production-review-2026-10-04.md) and [go-live checklist](docs/operations/release-readiness.md) |
| SCHED-01 | Erik's Google Calendar Appointment Schedule and JobTread association | Matt/Erik | Erik authorizes calendar access; confirm the schedule's project-reference answer is present in the API event; verify event-to-JobTread task create/reschedule/cancel and timezone behavior; only then enable scheduled sync | Open |
| FUNNEL-01 | Erik-approved lead-funnel questions and selections | Erik/Matt | Agree exact wizard questions, answer choices, required fields, and any fit/routing rules; approve customer-facing fees/ranges/copy; verify all paths while manual Erik review remains the default | Open |
| OPS-01 | Retire the protected operator page | Matt/BIS | Finish calendar connection and all required tests; document a replacement process for inquiry and calendar recovery; remove `/operator/` routes and verify they are inaccessible | Open |
| DESIGN-01 | Design fee/package | Erik | Approve fee, package, and copy | Open |
| ANALYTICS-01 | GA4 baseline | Matt/BIS | Verify measurement ID + approved tracking/privacy behavior | Open |
| NOTIFY-01 | Operational alerting/monitoring | Matt/BIS | Agree on owner-approved email alerting or an explicit operator-monitoring process and verify it; SMS is deferred from this go-live per Matt | Open (email/monitoring); SMS deferred |
| RELEASE-01 | Source ADR/cutover | Matt/BIS | Review cutover runbook, complete the one final review in [go-live checklist](docs/operations/release-readiness.md), and record explicit launch authorization | Open |
