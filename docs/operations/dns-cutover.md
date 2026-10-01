# Production DNS cutover

**Status**: Draft. Matt/BIS must review; no cutover is authorized.

Before release: finish approved scope, QA, code/adversarial and stakeholder gates; retrieve source stack ADR; record Erik's direction/tagline/mark; resolve every placeholder. Verify production contains one token set and no toolbar/switching scripts. Approve canonicals, sitemap, analytics, security headers, and removal of draft noindex controls. Bootstrap is not release-ready.

Record observed Porkbun records/TTLs, current and proposed hosting targets, TLS readiness, responsible people, window, monitoring, rollback triggers, and known-good deployment. Lower TTL ahead of the authorized window if appropriate. Obtain explicit release and DNS-change authorization.

After authorization:
1. Deploy the reviewed artifact to a separate production project.
2. Verify TLS/domain mapping, then change only the approved web records. Preserve mail/unrelated records.
3. Verify resolution, HTTPS, redirects, pages/assets, real live inquiry delivery to JobTread, photos, notifications, and other launch-critical paths. Confirm analytics/alerts without logging PII.
4. Record production verification and handover evidence.

If agreed critical checks fail, restore recorded prior web records and known-good deployment; preserve leads and prevent duplicate delivery. Verify rollback and return to review before retrying release. Fill exact targets, TTLs, window, and rollback triggers from real infrastructure before approval.
