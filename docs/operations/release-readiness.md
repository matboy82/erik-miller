# Release readiness checklist

**Status**: Draft checklist — this document does not authorize release.

Use one approved story-specific `$sdd-release` plan for each rollout. Do not deploy, change DNS, publish content, configure accounts, send messages, or submit a live inquiry from this checklist alone.

## Before requesting release authorization

- [ ] Selected implementation packages and development/test evidence are complete.
- [ ] Required fresh-session code and adversarial reviews are recorded; stakeholder approvals are recorded for the exact site, wizard, and review copy.
- [ ] Production build passes accepted brand, content, placeholder, and complete-output guards.
- [ ] `PUBLIC_SITE_URL`, canonicals, sitemap, robots rules, redirects, security headers, and measurement behavior match the approved domain and privacy decisions.
- [ ] JobTread, booking, notification, review, and recovery capabilities have exact owner-approved operation plans and sanitized evidence where required.
- [ ] Every Open placeholder has its exact unblock evidence or remains a release blocker.
- [ ] Rollback triggers, steps, owners, monitoring, and recovery checks are written in the story-specific release plan.
- [ ] Matt's explicit authorization names the deployment, DNS/account changes, publications, and live inquiries being performed.

## After separately authorized release

- [ ] Record deployed revision, actual URLs, build result, and relevant live response checks.
- [ ] Verify a real inquiry reaches the intended JobTread records without retaining PII in the report.
- [ ] Verify booking/review/publication behavior only if named in the approved plan; sanitize evidence and confirm cleanup.
- [ ] If a required check fails, stop new activity, follow the approved rollback, preserve accepted leads, and record the outcome.

The current root [placeholder register](../../PLACEHOLDERS.md) includes open brand, project/page content, JobTread, booking association, analytics, notification, redirect-map, infrastructure, and release prerequisites. A Draft demo does not close them.
