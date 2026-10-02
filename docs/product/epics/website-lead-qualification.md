# Miller Remodeling: website and lead qualification

**Status**: Approved
**Owner**: Matt / BIS; Erik approves business rules, brand, and customer-facing flows
**Created**: 2026-10-01
**Sources**: [Product brief](../briefs/prd-2026-10-01.md), [branding kit](../../brand/branding-kit-2026-10-01.md)
**Approval recorded**: Matt, 2026-10-01 — “I just approved it all, the status is Approved.”
**Scope amendment**: Matt, 2026-10-01 — stock assets and draft writeups may support development; real content must be easily swappable. Cloudflare/GitHub accounts and the JobTread API key are available. Evaluate JobTread booking before selecting an external scheduler.
**Booking amendment**: Matt, 2026-10-02 — required homeowner booking functions are unavailable in JobTread; use Erik's Google Workspace/Calendly. This supersedes native-first discovery and pending provider selection below. External integration/configuration still needs its later approved contract and verification; JobTread remains the system of record for customer/job intake.
**Next gate**: Create the QA plan for approved stories `MR-01` through `MR-04`, then obtain QA-plan approval.

## Outcome and users

Help Treasure Valley homeowners understand Miller Remodeling's paid design process, assess project fit, and request or book a consultation. Give Erik a complete lead brief in JobTread before he spends time designing. Turn completed work into approved portfolio entries and reviews with little ongoing effort.

Erik wants fewer, larger projects: eight roughly $100,000, three-month jobs rather than many small jobs. This system supports that goal; it does not guarantee revenue or close rates.

- **Homeowners** need credible project proof, clear expectations, accessible inquiry forms, and a useful next step even when their project is a poor fit.
- **Erik and his designer** need budget, location, timeline, description, and photos before consultation; Erik controls fit rules, availability, fees, and publishing approval.
- **Matt / BIS** owns delivery, hosting, maintenance, and approval coordination.

## In scope

1. **Reviewable foundation.** Complete the locally bootstrapped monorepo and establish verified CI, PR previews, a persistent test site, and a live health Worker. The test site lets Erik compare all three brand directions and their tagline, hero, and process copy. Direction A is the starting point. Missing content and accounts use clearly marked Draft placeholders registered with an owner and unblock condition.
2. **Professional website.** Deliver home, kitchen, bathroom, whole-home, additions, ADU/mother-in-law, home-repair, about/process, portfolio-index, and contact pages. Cover Eagle, Star, Meridian, Boise, Middleton, and Kuna with service-area pages. Explain the paid design phase and five-step process; place verified project or review proof near calls to action. General inquiries reach JobTread and are identified as general inquiries.
3. **Reliable intake.** Capture contact and qualification submissions, validate them, score project fit, attach photos and relevant fields to JobTread, and notify Erik. Repeated submissions must not create duplicates. Preserve leads during JobTread outages, retry delivery, and expose delayed or failed delivery to the operator.
4. **Qualification wizard.** Collect project type, location, timeline, budget, description, photos, prior-building experience/referral source, and contact details. Provide mobile progress, locally saved progress, clear errors, and an accessible completion path. Low-fit prospects receive a polite alternative next step and remain visible to Erik in JobTread. Qualified prospects receive a fit brief and paid-design expectations before booking.
5. **Consultation booking.** Show the approved design fee/package and let qualified prospects book using Erik's availability, timezone, and buffers. Prevent double-booking, support confirmations/reminders and cancellation/rescheduling, and record appointments in JobTread. An account placeholder supports test progress; production requires working booking and completed QA.
6. **Portfolio publishing.** Let Erik capture scope, challenges, results, before/after photos, and finished video from his phone. Entries include location/project-type tags and a review cross-link. Drafts require Erik's approval before publishing.
7. **Review flow.** Trigger a JobTread completion survey and Google review request for every completed job. Erik approves timing and request copy. Hold reviews until Erik approves publication to the site's testimonial layer. Requests must not incentivize reviews.
8. **Search and content foundation.** Provide valid business, service, review, and FAQ structured data where applicable, sitemap, canonicals, production robots rules, old-URL redirects, consistent business/profile links, and assistant-readable business information. Record search/AI visibility baselines and quarterly checks. Document portfolio-to-GBP/social templates, a quarterly case-study format, cadence, and ownership; WS-7 is included as bonus scope under Matt's approval of the full program.
9. **Staged release and handover.** Obtain Erik's site, wizard, and review-copy sign-offs; complete QA and review evidence; prepare rollout/rollback and DNS cutover instructions. Each public launch requires separate authorization and a real inquiry verified on the live domain. Deliver Erik's publishing/review/lead-reading runbook and BIS maintenance notes; fulfill agreed testimonial terms.

## Success measures

| Measure | Evidence or target |
|---|---|
| Site quality | Mobile Lighthouse performance, accessibility, SEO, and best practices each ≥ 90; LCP < 2.5 seconds; WCAG 2.1 AA verified beyond automated scores |
| Reliable capture | Every submitted inquiry reaches JobTread with the applicable fields and supplied photos; outage/retry and duplicate-submission scenarios pass |
| Lead fit | At least 60% of wizard completions are in-area and meet Erik's approved budget rules; record completion and step drop-off data |
| Design conversion | Establish a launch baseline for design-consult → signed design agreement; target > 35% on design-ready leads |
| Scheduling | A test booking reaches Erik's calendar and JobTread; reminders, cancellation/rescheduling, and concurrent booking checks pass |
| Portfolio usability | Erik completes a phone-based entry publishing walkthrough in < 15 minutes; aim for ≥ 1 approved portfolio entry per completed job |
| Reviews and content | Completion sequence and publishing approval pass on a test job; one real portfolio → GBP → social pass; Erik's effort < 30 minutes per job |
| Operational handover | Live-domain inquiry verified after each launch, runbooks delivered, and agreed testimonial captured |

Business targets are measured after launch. They are not substitutes for release evidence. Test deployments remain noindex; their SEO score does not establish production SEO readiness.

## Constraints and exclusions

- Use the existing static-first Astro + React + TypeScript monorepo on BIS-owned Cloudflare Pages, with the Worker scaffold as the intake starting point. No WordPress, theme/plugin stack, or Zapier/Make build dependency. Technical planning must verify the referenced stack ADR before relying on it.
- JobTread remains the system of record. Durable outage handling does not authorize a CRM replica or select a database. Verify the official Pave contract before dependent integration work.
- Keep secrets server-side in a secret store, use least-privilege access, and keep lead PII out of client bundles, repository, fixtures, and logs. Define retention, local-progress handling, secure photo handling, validation, spam/rate controls, security headers, HTTPS, and failure alerting during approved planning.
- Development/test builds may use licensed stock assets and clearly marked Draft writeups under Matt's 2026-10-01 amendment. Label stock images as development placeholders rather than Miller work, register their source/license and replacement owner, and keep content separate from layout so real photos/writeups can replace them without page rewrites. Production requires approved Miller project photography and factual writeups; exclude development assets and invented claims. Verify reviews, ratings, licensing, and other factual claims before publication.
- Erik chooses the direction, tagline, and final logo. Production contains exactly one approved token/copy set and no review toolbar, theme-switching code, or alternative token blocks.
- Every Open entry in the root placeholder register blocks production. Staged delivery does not waive this gate. Production SEO/analytics and DNS cutover require approved readiness and explicit launch authorization.
- Exclude paid-ad management, an ongoing SEO retainer, delivery of the design service itself, video production, a native app, and unrelated JobTread reconfiguration. Erik captures source media; BIS provides publishing support.
- Epic approval permits story planning only. It does not approve implementation, account changes, commits/pushes, external posting, deployment, or DNS changes.

## Proposed story slices and order

These are planning candidates, not approved stories. WS labels trace to the brief; Matt must assign `MR-...` keys before story artifacts are created. Split candidates into small observable outcomes during story planning.

| Order | Candidate outcome | Dependency / source |
|---|---|---|
| 1 | Verified test foundation and brand/copy comparison | Existing local bootstrap; remaining WS-0 evidence |
| 2 | General inquiries reliably reach JobTread, including outage recovery | Foundation + verified Pave contract; WS-2 |
| 3 | Homeowners can evaluate services, proof, and paid design on the foundation site | Foundation + contact path + approved content; WS-1, then Phase 0 review/release |
| 4 | Homeowners complete qualification; Erik receives briefs and photos for both qualified and low-fit leads | Intake + Erik's fit/question decisions; WS-2/WS-3 |
| 5 | Qualified homeowners book and manage a consultation | Wizard + fee/availability + scheduler; WS-4, then Phase 1 review/release |
| 6 | Erik publishes approved job stories from his phone | Portfolio site + supplied project media; WS-5 |
| 7 | Completed jobs trigger review requests and approved site reviews | Site + JobTread workflow access + review policy; WS-6 |
| 8 | Search/AI visibility is measured and completed work feeds a sustainable content cadence | Site + portfolio pipeline; WS-8 and bonus WS-7 |
| Each release | QA, stakeholder sign-off, rollout/rollback, production verification, and handover | Selected release scope; WS-9 |

Stories → QA plan → technical spec/packages/required ADRs → implementation → review → release remain separate gates. WS-2, WS-3, WS-4, and WS-6 require independent adversarial review in a fresh session. Local bootstrap evidence does not mark WS-0 complete.

## Dependencies and material risks

- **Business and brand decisions:** fee/package, fit thresholds, questions, service coverage, availability, and Erik's direction/tagline/logo control customer behavior and release readiness.
- **External access and contracts:** Matt confirms Cloudflare and GitHub accounts exist, has the JobTread API key, and can add secrets using the [test setup guide](../../operations/cloudflare-test.md). Project/repository configuration, CI secret wiring, and live integration evidence remain to be established. Evaluate JobTread's homeowner self-booking support first; select Calendly or another booking page only if needed. Pave verification must establish field/photo/appointment behavior before dependent work.
- **Content and policy:** missing approved photos, writeups, review evidence, or usage rights can block production. Draft content supports review only; it cannot satisfy the placeholder gate.
- **Lead loss and privacy:** outages, partial delivery, duplicate records, and unsafe uploads can undermine trust. Approved QA must cover these failures and operator recovery, using synthetic/redacted data.
- **Adoption and conversion:** a long wizard or difficult publishing workflow can reduce use. Measure drop-off and conduct Erik's timed walkthroughs rather than assuming usability.
- **Launch continuity:** redirects, analytics/privacy decisions, missing source ADR, and DNS rollback need explicit readiness evidence. Review-site builds and local measurements do not prove remote CI or live behavior.

## Approval and delivery dependencies

Matt explicitly approved the full program, source documents, and epic on 2026-10-01 and directed that status be Approved. This instruction supersedes the earlier epic-approval stop. It does not supply business values or establish external verification evidence.

The approved order allows test-site work and content collection in parallel, with Phase 0 before Phase 1 and WS-7 included as bonus scope. The production placeholder gate and hold-until-approved review default remain in force.

The following dependencies remain for the relevant story, technical-planning, or release gate:

- **Erik:** provide the design fee/package, fit thresholds, wizard questions, low-fit alternatives, availability, and review timing/copy before dependent behavior is approved.
- **Erik/Matt:** select the direction/tagline/final mark and supply approved project media and claim evidence before brand lock and production.
- **Matt/Erik:** finalize testimonial format, timing, usage rights, and its launch/handover requirement before release planning.
- **Matt/BIS:** verify official Pave capabilities and retrieve the stack ADR before dependent technical planning; choose scheduler/notification providers, analytics/privacy behavior, retention rules, and measurement windows in the relevant approved contracts. GA4 remains the brief's default pending verification.

### First story batch

1. **Verified CI and test deployment:** Matt/Erik can open a persistent noindex review site, observe a healthy test Worker, and review a same-repository PR preview after passing CI. Account existence is confirmed; project setup and live evidence remain part of the outcome.
2. **Brand/copy review:** Erik can compare A/B/C and their copy on the test site; production artifacts contain one approved direction and no review controls or alternative tokens.
3. **Swappable development content:** reviewers can inspect labeled stock photography and Draft writeups; replacing them with approved Miller content preserves page layout. Production blocks unresolved development content.
4. **Verified JobTread capabilities:** Matt has evidence for lead/field/photo integration and a documented decision about native homeowner booking versus an external booking page. Public project-calendar documentation alone does not prove self-booking.

Matt assigned starting number `01` on 2026-10-01 for the four-story local batch; no Jira instance is required. Matt approved all four stories on 2026-10-01. Approved artifacts:

- [MR-01: Verified CI and test deployment](../stories/website-lead-qualification/mr-01.md)
- [MR-02: Brand/copy review](../stories/website-lead-qualification/mr-02.md)
- [MR-03: Swappable development content](../stories/website-lead-qualification/mr-03.md)
- [MR-04: Verified JobTread capabilities](../stories/website-lead-qualification/mr-04.md)

These approved stories establish the foundation before dependent lead, wizard, booking, publishing, and release stories.

Do not invent these values or mark their placeholder entries complete. Any resulting change to approved scope or success measures requires an explicit amendment.

## Next gate

Epic and story approval and local key assignment are recorded. The next phase is `$sdd-qa-plan` for `MR-01` through `MR-04`; technical planning and implementation follow their separate gates.
