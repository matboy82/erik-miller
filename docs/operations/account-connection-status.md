# Account connection status

Verified 2026-10-04. This supersedes the disabled candidate setup recorded on October 3.

| Item | Current result |
|---|---|
| Website | Published at https://erik-miller-web.pages.dev using `SITE_BUILD=live` |
| Search visibility | `PUBLIC_INDEXING_ENABLED=false`; draft content stays noindex |
| Final domain | `https://millerremodelingidaho.com`; DNS has not changed |
| Forms | Live intake enabled; contact and project/photo browser submissions independently delivered to JobTread |
| Spam protection | Turnstile permits the Pages hostname, millerremodelingidaho.com and www.millerremodelingidaho.com |
| Worker origins | The same three HTTPS origins are permitted |
| Photos | Private R2 staging; actual JobTread original-byte verification passed after correcting Workers redirect handling |
| Storage and delivery | D1 migrations 0001–0004, private R2, delivery/dead-letter queues and scheduled jobs connected |
| Operator | Cloudflare Access protects `/operator` and `/operator/*` under one application; only Matt and Erik's Gmail allowed |
| Operator login | Matt login verified; Cloudflare and email one-time PIN available |
| JobTread | Runtime secrets installed; customer/contact/location/job/file API operations verified using synthetic records |
| Google configuration | Client ID, runtime client secret, token encryption key, calendar ID and callback configured |
| Calendar ID | `millerremodelingidaho@gmail.com` |
| Calendar synchronization | Disabled until Google consent and a real calendar read succeed |

Operator: https://erik-miller-worker.matt-boyer.workers.dev/operator/

## Remaining calendar setup

Matt explicitly approved OAuth publication and the GitHub release push on October 4. Google OAuth is now External / In production, verified in the console. Google flags the app as requiring verification; production publishing does not mean verification is approved. The release commit edd978e is pushed to the existing GitHub main branch.

Erik opens the operator URL, signs in with his Gmail using the email PIN, clicks **Connect Erik's Google booking calendar**, and grants the requested calendar read scope using the account that owns the booking calendar. Codex can then verify encrypted token storage, actual calendar access and synchronization before setting `BOOKING_SYNC_ENABLED=true`.

The Google booking form must collect the exact website project reference and include it in the event description. The real booking reference field and Google-to-JobTread end-to-end booking flow remain unverified. JobTread task creation, deduplication, rescheduling and cancellation passed direct API tests; these do not prove the Google connection.

## Other launch checks

Final design/content/images remain Matt and Erik's editing work. Automatic fit decisions are not configured; every project requires Erik's review. Operational email/SMS alerts are not configured or verified. Synthetic JobTread records were retained for inspection, with API notifications disabled and zero active vendor workflows observed before testing. No customer appointment was booked.

See [production review](production-review-2026-10-04.md) and [DNS cutover](dns-cutover.md). No credentials or private vendor record IDs are recorded here.
