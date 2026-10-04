# JobTread and booking setup

Updated 2026-10-03. Matt requested direct implementation, with one review before production. Earlier SDD gate text is historical; this guide describes the current code and remaining account setup.

## Implemented

- Home/contact forms submit to `/intake/contact`; `/qualify/` submits the complete project brief to `/intake/project`.
- D1 commits an inquiry before the Queue accepts its reference. Browser retries reuse the same key and frozen payload. A confirmation means durable receipt, not completed CRM delivery.
- JobTread delivery creates the customer, location, contact, and job, then reads the contact value and job links/description back. All project answers are preserved in the job description. Existing option fields are not guessed or changed.
- Up to three photos are resized and re-encoded in the browser, checked at the server, staged privately in R2, uploaded using JobTread's instructions, attached to the job, and downloaded for checksum verification. Verified staged bytes are deleted. Uncertain writes require reconciliation.
- Google booking changes are saved in a durable inbox and synchronized every five minutes. Each event creates one JobTread consultation task; rescheduling updates that task and cancellation removes it after checking ownership. Missing lead delivery is retried later. Uncertain writes stop for operator recovery.
- `/operator/` provides protected setup checks, receipt status, retry/reconciliation, a Google consent connection, and calendar-sync recovery. It is a recovery tool; normal configured calendar synchronization does not require an operator.

Project fit currently means **Needs Erik's review** for every submission. The site does not automatically qualify or reject anyone. Erik's budget, timing, service-area rules, alternatives, and design-fee copy are still needed before automatic fit decisions can be implemented and verified.

## Connect the accounts

Use [Connect Cloudflare, JobTread, and Google Calendar](connect-accounts.md) for the complete setup instructions. Each step names the application, screen, setting type, value source, and success check. Wrangler commands run in local PowerShell from the repository folder, not inside the R2 dashboard.

Matt completed Cloudflare sign-in. Codex verified the private R2 bucket and existing queues, applied all four remote D1 migrations, deployed the disabled Worker candidate, installed JobTread/Turnstile secrets, and configured Pages' public settings. See [account connection status](account-connection-status.md) for current evidence and remaining Access/Google work.

The integration candidate has been deployed to the existing Worker with intake and booking synchronization disabled. The website has not been republished, and this setup has not created live JobTread records, booked appointments, or sent customer messages.

## Test before the single production review

Use synthetic records and intended test recipients. Confirm workflow side effects first, including vendor-side automation; `notify:false` suppresses the API notification flag but does not prove all configured workflows are silent.

Exercise contact and project receipt; email and phone contact values; photo upload and original-byte readback; repeated submission; JobTread outage and partial delivery; operator recovery; Google consent; booking, reschedule, cancellation, timezone/DST, and the actual project-reference question. Verify records in JobTread independently and remove or explicitly retain synthetic artifacts. Do not claim those live scenarios pass from local mocks.

Local coverage uses actual SQLite migrations and transport/storage doubles for complete delivery, duplicate prevention, unknown outcomes, byte identity, retention, automatic calendar changes, durable event recovery, and encrypted OAuth storage. A browser smoke check also submits contact and a project/photo through actual local Wrangler D1/Queues/R2 at 390px, with no browser errors or contact details in local storage. The browser resizes a licensed stock JPEG; the small capability-probe PNG is not suitable for browser image-decoding verification.

## Recovery and retention

Look up the inquiry reference in `/operator/`. Retry only non-ambiguous failures. For a `*_writing` step, locate and independently verify the marked JobTread record before confirming **present** with its ID or **absent**. Photo steps use `photo_0_upload`, `photo_0_file`, and corresponding indices 1/2. Consultation recovery uses the Google event ID plus the verified task outcome. Automatic sync resumes after reconciliation; it never blindly recreates an uncertain task.

Successful inquiry payloads expire after seven days; undelivered payloads after 30 days; metadata after 90 days. Staged photos are deleted after verified attachment or on expiry, including orphan staging objects. Booking mappings currently share that 90-day inquiry metadata window: keep schedule lead time inside that window and review retention if longer-range bookings are needed. Backup retention, deletion behavior, and alerts must be verified in the actual Cloudflare account.

Disable `INTAKE_ENABLED` to stop new inquiries. Disable `BOOKING_SYNC_ENABLED` to stop calendar writeback. Preserve accepted ledgers and objects during recovery. Production still needs final design/content/images, actual connection tests, the requested review, and launch authorization.

Official interfaces: [JobTread API](https://app.jobtread.com/docs), [Google booking setup](https://support.google.com/calendar/answer/10729749?hl=en), [Calendar incremental event reads](https://developers.google.com/workspace/calendar/api/v3/reference/events/list), and [Google offline OAuth](https://developers.google.com/identity/protocols/oauth2/web-server).

## Verification recorded 2026-10-03

- `npm run check`: exit 0, 80 tests passed, review/Worker builds, design checks, and A/B/C/mixed-choice synthetic production isolation passed. These synthetic renderers do not establish final interactive production readiness.
- After the final recovery/readback changes: `node --test apps/worker/test/project.test.ts apps/worker/test/intake.test.ts`: exit 0, 28 passed; Worker typecheck, lint, and final Worker dry-run build passed.
- Local Wrangler migrations applied successfully. Browser contact/project/photo smoke passed at 390px; no console errors, overflow, stored contact/description data, or direct JobTread/booking requests.
- The supplied actual JobTread credential was excluded from all 94 inspected web/Worker output files. `git diff --check` passed.
- Remote Cloudflare authentication, live JobTread/photo proof, Google consent/reference readback, actual notifications, fit thresholds, and final content/release review remain open.
