# Lead conversion setup — email first

Implemented from Matt’s October 5, 2026 addendum request. Matt requested this work now and explicitly deferred SMS; the addendum’s draft status and Phase 2 sequencing do not override that instruction. Owner approval of factual figures and outbound copy is still required. No SDD approval is inferred or recorded.

## What is ready

- The operator page has forms for project-specific planning ranges, cost-guide text, review platforms/timing/copy, and up to three email follow-ups on days 1–14.
- Saving a draft invalidates its prior approval and cancels unsent messages. Only Erik’s authenticated operator identity can approve the current revision. A separate runtime switch controls activation.
- Approved ranges appear on the project review step before submission and booking. They are labeled planning ranges, not quotes. No project is reclassified as qualified by this addendum; the current “needs Erik’s review” behavior remains until his fit rules exist.
- An approved cost guide appears as a section on `/qualify/`. Name/email are required; phone is optional and captured alongside email. The intake creates a JobTread customer/contact/job with `lead_magnet` in the description and a “Cost guide” job label. The download becomes available after verified JobTread delivery. The approved text is snapshotted per request; the initial download format is plain text. No numbers are supplied by the implementation.
- The wizard, contact form, and guide form offer a separate optional email follow-up checkbox. Phone-only inquiries cannot enter email nurture. No SMS checkbox or sending path exists.
- Nurture enrolls newly delivered, opted-in inquiries created within the preceding day. Missed touches expire rather than accumulating a backlog. Each scheduled day has a one-day delivery window; the final permissible touch is day 14. At most three touches are ever queued for an inquiry.
- Recorded Google events, including events still awaiting JobTread delivery, permanently stop nurture. A cancellation does not restart it. Nurture is disabled unless booking sync is enabled. Operator stop and unsubscribe also stop the sequence. Reply handling is manual: Erik should use Stop follow-ups when a homeowner replies or is no longer a candidate.
- Review requests poll JobTread’s `closedOn` for retained website inquiries. A JobTread Workflow completion callback supports other completed jobs, including projects whose original website receipt has expired. Job organization, job closure, contact ownership, and customer email are read back before scheduling. Old closures outside the request window are rejected.
- Review links are direct HTTPS links on confirmed Google/Facebook/Houzz hosts. Requests use neutral, owner-approved text. There is no sentiment gate or incentive.
- A homeowner can report that they posted a review. That queues an approved thank-you and an email notification to Erik. This is a self-report, not verified platform detection. Erik must verify the actual review. No review-platform API credentials or automatic platform polling are configured, and nothing publishes to the website testimonial layer.
- Sent touches are logged as internal JobTread comments. Outbound email failures cannot change a verified inquiry’s delivery status. A definite pre-send rejection retries within the touch window, at most five attempts; ambiguous sends are held for reconciliation. Ambiguous JobTread comment writes are held, never blindly repeated.

## Where to configure it

Open [Intake operations](https://erik-miller-worker.matt-boyer.workers.dev/operator/), then **Lead conversion setup · email only → Load settings**.

1. Matt can enter drafts for Erik to review. Leave unknown ranges and guide figures blank. Do not enable an incomplete guide or message workflow.
2. Erik signs in using his Gmail and the emailed PIN. He loads and checks the saved draft, then selects **Erik: approve this exact draft**. This does not send anything.
3. Connect the sending account and verify delivery to an owner-controlled test address before activation. Verify the business mailing address and reply-to inbox. These are deliberately blank pending actual owner input.
4. Finish Google calendar connection and verify booking detection before enabling nurture.
5. Connect the completion trigger and confirm its readback with a test job before enabling the review workflow.
6. Set the Worker runtime variable `CONVERSION_ENABLED=true` only after the preceding checks and approvals. It currently remains `false`. Changing draft content removes approval immediately.

The sender adapter uses the existing Cloudflare platform’s [Email Service Workers binding](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/). No external email SaaS or SMS provider was added. Email Service eligibility, its plan/cost, domain verification, and permitted use must be confirmed before adding the `EMAIL` binding or enabling sending. Confirm with Cloudflare that the proposed opted-in nurture/review messages are allowed by the account’s service policy; if a different email provider is required, choose it explicitly before connecting it. No plan upgrade or billing agreement was accepted.

The proposed Wrangler binding is `"send_email": [{ "name": "EMAIL" }]`. It is not in the deployed configuration yet because no sending domain/account has been verified. The sender must be on the verified owner domain; it cannot impersonate Erik’s Gmail. His Gmail can be the reply-to and operator notification address.

## JobTread completion connection

Configure a native JobTread Workflow for job completion once Erik approves this workflow. Use its supported HTTP action if available in his account; otherwise the authenticated operator completion form is the supported manual path until that action is verified. No Zapier connection was added.

- Endpoint: `POST https://erik-miller-worker.matt-boyer.workers.dev/conversion/job-completed`
- Authorization: `Bearer <CONVERSION_WEBHOOK_SECRET>` in the HTTP header, never in the URL. This secret is not provisioned yet; without it the endpoint rejects requests.
- JSON: `{ "jobId": "<completed job ID>", "contactId": "<customer contact ID>" }`
- Select the actual customer contact in the job’s account, not an arbitrary email supplied to the endpoint.
- Repeated events for a job do not queue duplicate asks. The receipt is returned for operator inspection. JobTread remains the source of truth.

Review publication approval, source verification, and usage permission are separate from requesting or thanking for a review. The staged testimonial pack remains held.

## Recovery and privacy

Use **Check follow-up delivery** to see pending, sent, cancelled, failed, or unknown sends and their JobTread timeline state. For `unknown`, inspect the provider log before selecting a verified outcome in **Completed jobs and message recovery**. A verified provider ID records a sent email without resending. “Confirmed no email accepted” allows the original bounded retry. An expired, unsubscribed, booked, or exhausted message still cannot send. An `unknown` timeline write requires checking the internal job comments; leave it held until reconciled by maintenance rather than risking duplicate comments.

No automatic fallback email can succeed through the same unavailable sender. Failures are visible in the operator ledger and sanitized Worker logs. SMS failure behavior is deferred with SMS.

Contact details, guide snapshots, and message copy in the conversion ledger expire after thirty days; inquiry metadata follows the existing ninety-day policy. Completion-event deduplication keeps only the job ID, receipt ID, and event time for up to one year. An expired inquiry’s later completion is rehydrated from JobTread, rather than retaining old website contact details indefinitely. Guide links expire after seven days. Tokens are bearer links: no-store/no-referrer responses, no token logging, and no public receipt lookup.

## Activation inputs still needed

- Erik-approved project ranges and scope descriptions.
- Approved guide text and every factual figure. No `$100k` or three-month assertion is copied from the draft automatically.
- Confirmed review URLs, ask timing, request wording, and thank-you wording.
- Approved nurture days/copy (up to three touches, day 14 latest); real postal address and monitored reply-to.
- Verified email sender/domain, account eligibility, and deliverability test.
- Active calendar sync plus the completion-trigger test.
- If automatic review detection is desired, a confirmed platform integration; currently homeowner reports and Erik’s verification are supported.

SMS, room scanning, paid ads, referral campaigns, and automated testimonial publication are not enabled by this work. Domain DNS and indexing settings are unchanged.
