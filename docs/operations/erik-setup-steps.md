# Erik: connect your calendar

These steps apply after Matt has added `erik@millerremodelingidaho.com` to the Cloudflare Access policy and deployed the reviewed Worker configuration. The footer's **Staff sign-in** link opens a protected page; customers cannot use it to see inquiries.

1. Open the Miller Remodeling website and select **Staff sign-in** in the footer.
2. Enter `erik@millerremodelingidaho.com`. Open the one-time code sent to that inbox, then enter it on the sign-in screen.
3. On the operations page, select **Connect Erik’s Google booking calendar**.
4. Sign in to Google as `erik@millerremodelingidaho.com` and allow the requested read-only calendar access. Return to the operations page when Google finishes.
5. Send Matt the public booking-page link from your Google Calendar appointment schedule. Do not send a password or Google verification code.

Matt will add the booking link, test a sample inquiry and booking, check the matching JobTread task, and enable automatic sync only after the test succeeds. If the login or Google screen reports an access error, send Matt the exact message; do not retry with a different Google account.

## Sender setup for Matt

- Onboard the sending domain to Cloudflare Email Service and configure a Worker `send_email` binding, sender authorization and DNS records without disrupting Workspace MX records. Verify whether the existing SPF record must be amended rather than adding a second SPF record.
- Use `erik@millerremodelingidaho.com` as From and Reply-To after authorization is verified. Confirm replies reach Erik's Workspace inbox.
- Obtain a valid business mailing address for the footer of promotional emails; a registered USPS PO box or qualified private mailbox can be used. Do not publish Erik's street address on the website.
- Review [service-specific nurture drafts](lead-nurture-drafts.md), implement their selection in the automation, configure the schedule and sender, and verify unsubscribe and calendar stop behavior before sending.
