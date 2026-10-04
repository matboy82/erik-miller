# Production review - 2026-10-04

Matt authorized production hosting ahead of final content and business DNS cutover, and waived SDD. This records the requested release review and connected evidence; it is not an independent agent review.

## Corrections

- Cloudflare Workers rejected `redirect: error` in photo upload. Photo and Google calls now use `manual`, inspect status and reject redirects without following them. Transfer origins remain restricted. Regression assertions cover uploads/downloads, token exchange and event reads.
- Matt installed the Google client secret as a runtime Worker secret after its initial placement in build variables. Its presence was verified without exposing it.
- Both operator paths share one Access application and audience. Only Matt and Erik are allowed. Email PIN login was added with Matt's approval.
- Live hosting supports current content while keeping indexing disabled; no prior SDD content approval was fabricated.

## Evidence

- Production browser contact submission delivered to JobTread.
- Production project/photo submission delivered after retry of the same inquiry, reusing its existing project. Independent JobTread readback matched all 190190 original photo bytes by SHA-256; the private R2 staging object returned 404 after delivery.
- Direct real JobTread proof covered customer/contact/location/job/file readback and task creation, deduplication, reschedule and cancellation. Synthetic records were retained for inspection; the canceled task's absence was verified.
- Supplied Google booking iframe loaded Job Walk With Erik. No actual Google appointment was created.
- Matt operator login passed. Unauthenticated requests redirect to Access. Public intake retains its CORS checks.
- Focused Worker tests: 28 passed after redirect fix. Lint and type checks passed. Final full test suite: 83 passed. Live build: 17 routes.

## Release boundary

Forms and photo delivery are live on the Pages hostname. Business DNS is unchanged. Final content/images, custom-domain HTTPS and indexing activation remain before business cutover.

Calendar sync is disabled pending explicit OAuth publication approval, Erik's consent and real booking-reference/event verification. Operational email/SMS alerts and automatic fit thresholds are not configured. Direct API and mocked calendar tests do not establish Google end-to-end readiness.

Flags: `INTAKE_ENABLED=true`, `BOOKING_SYNC_ENABLED=false`. Enable booking only after actual calendar read and event/reference readback pass.

Final Worker deployment: `6572efc7-2cec-4d24-8c0a-3b9f098323e7`.
