# Customer-only inquiry release verification — 2026-11-06

Matt approved a bounded synthetic test, cleanup, migration, and release. The test created one clearly marked synthetic customer, contact, internal comment, customer task, and customer photo in Miller Remodeling LLC. It created no job or location and sent no email. Before the test, a read-only check found zero active JobTread workflows.

The customer name and organization, contact name and email/phone fields, customer ownership and internal visibility of the comment, customer ownership and dates of the task, and customer ownership and original-byte checksum of the photo were verified through JobTread readback. The synthetic task, file, comment, contact, and customer were deleted and each deletion was verified. The upload request has no documented delete operation; the temporary uploaded bytes remain subject to JobTread retention, as approved.

Cloudflare account and database were verified before migration. The intake ledger contained 11 delivered submissions and no in-progress entries immediately before the migration. D1 Time Travel returned a recovery bookmark. Migration 0009 was applied and Wrangler subsequently reported no pending migrations. Existing JobTread records were not renamed or deleted by the migration.

Local verification: 114 tests passed, plus focused customer-only and ambiguous-write tests; type checks and lint passed; the Worker dry-run build succeeded. Schema support and the synthetic test verify only the tested account and operations, not every future runtime condition. Release deployment and the deployed health check must still be recorded after the push.
