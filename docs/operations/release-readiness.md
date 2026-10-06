# Miller Remodeling go-live checklist

**Status**: In progress. This is the working checklist for the single review before production. Matt explicitly asked to skip the SDD flow; no separate SDD release plan is required. This checklist does not itself authorize a production deployment or DNS change.

Close each item only when the listed evidence is available. The [placeholder register](../../PLACEHOLDERS.md) tracks owner inputs and open blockers; the [SEO and domain launch checklist](seo-domain-launch-checklist.md) has detailed domain, indexing, and search checks.

## Verified complete

- [x] JobTread intake is live and configured. Production contact/project submissions and photo delivery were read back from JobTread; direct API checks covered customer/contact/location/job/file operations and consultation-task create, deduplication, reschedule, and cancellation. The live operator readiness check returned `jobtreadConfigured: true`. See [production review](production-review-2026-10-04.md) and [account status](account-connection-status.md).

## Remaining before the one final review

- [ ] **Finalize design, content, and project photos.** Replace development stock/substitute assets with Erik-approved Miller project photos and stories; document image permission/provenance; finalize page copy and verify every business/service-area fact. Close the related `CONTENT-*`, `BRAND-01`, and `DESIGN-01` entries in the placeholder register. See [project content](project-content.md), [site pages](site-pages.md), and the [design imagery list](../content/design-imagery.md).
- [ ] **Finalize the lead-funnel questions and selections with Erik.** Agree on the exact questions, answer options, required fields, and any routing/fit rules. Approve any budget ranges, timing/fee guidance, and customer-facing copy before they appear. Keep every lead in “Needs Erik’s review” until Erik approves explicit fit rules; do not infer automatic qualification. Record the accepted choices and verify each path in the wizard. See [functional launch setup](functional-launch.md) and [lead-conversion setup](lead-conversion-setup.md).
- [ ] **Finish Google Calendar-to-JobTread booking verification.** JobTread intake is complete; appointment association is not. Erik must authorize the calendar connection from the protected operator page using the account that owns the appointment calendar. Verify a real calendar read and that the required project reference appears in the event data, then verify the matching JobTread task and its reschedule/cancellation behavior. Keep `BOOKING_SYNC_ENABLED=false` until these checks pass; then enable it and confirm the five-minute scheduled sync. See [account status](account-connection-status.md) and [booking setup](booking.md).
- [ ] **Retire the operator page as requested.** First complete calendar consent, booking verification, and any required intake recovery. The protected `/operator/` page currently provides Google consent, inquiry recovery, and calendar recovery. Document the replacement process for those operations, then remove the page/routes and verify `/operator/` and `/operator/*` are no longer usable. See [functional launch setup](functional-launch.md).
- [ ] **Close the other applicable open launch prerequisites.** Review `PLACEHOLDERS.md`, including verified business details, the old-URL redirect map, privacy/legal information, deployment/CI evidence, and agreed email alerting/monitoring. SMS remains deferred and is not part of this go-live checklist.

## One final review, then production

- [ ] Matt and Erik complete one review of the final design, content, images, lead-funnel behavior, and booking/recovery behavior. Record any changes from this review and finish them before production; this is the agreed review, not the start of an SDD approval sequence.
- [ ] Complete the [domain launch checklist](seo-domain-launch-checklist.md): bind and verify the custom domain and HTTPS, preserve mail DNS records, check redirects/canonicals/schema/robots/sitemap, and enable public indexing only after approved final content and verified business facts are in place.
- [ ] Run the accepted production build and release checks against the reviewed content. Confirm public forms and JobTread delivery, operator-route removal, custom-domain response behavior, and the intended booking state.
- [ ] Matt gives the final go-ahead for the reviewed production deploy, DNS cutover, and indexing changes. Record the deployed revision and actual URLs; do not make an additional content or infrastructure change outside the reviewed scope without returning for review.

## After production

- [ ] Verify deployed Pages and Worker revisions, custom-domain HTTPS/redirects, public indexing controls, form/photo delivery, and operational monitoring.
- [ ] Verify booking sync only if its end-to-end checks above passed and it was enabled for this release. If any required check fails, keep the affected feature disabled and preserve accepted inquiries for recovery.
