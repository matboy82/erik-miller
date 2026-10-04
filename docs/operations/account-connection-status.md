# Account connection status

Verified 2026-10-03 after Matt completed Wrangler's browser login.

## Completed in Cloudflare

| Item | Verified result |
|---|---|
| Wrangler authentication | Logged into the account containing this project's resources |
| R2 photo bucket | `miller-intake-photos` exists; public development access disabled; no public custom domains |
| D1 database | Existing `miller-remodeling-intake` retained; migrations 0001–0004 applied remotely |
| Queues | Both existing delivery/dead-letter queues retained; producer and consumers deployed |
| Worker candidate | `erik-miller-worker`, version `b739f4d9-cab8-4efe-af18-fae3bf108e9c` |
| Resource bindings | D1, Queue, and private R2 bindings verified after deployment |
| JobTread settings | Existing API key and verified customer-contact field IDs installed as Worker secrets |
| JobTread authentication | Fresh read-only authentication passed; one organization, complete field inventory |
| Turnstile | Managed widget created for `erik-miller-web.pages.dev`; secret installed on Worker |
| Google token encryption | Encryption key generated and installed as a Worker secret |
| Pages build settings | Public Worker URL and Turnstile sitekey saved for production/preview builds; existing review mode preserved |
| Credential placement | JobTread key/API URL removed from Pages build settings after Worker installation |
| Disabled-state checks | `/health` 200; intake 503 `intake_disabled`; operator 401 without authorization; website CORS preflight 204 |

Worker URL: [erik-miller-worker.matt-boyer.workers.dev](https://erik-miller-worker.matt-boyer.workers.dev).

`INTAKE_ENABLED=false` and `BOOKING_SYNC_ENABLED=false` remain in place. This is an integration candidate deployment, not the public business launch. No customer inquiry, JobTread record, appointment, or customer message was created during this setup.

## Remaining account work

- Cloudflare Access: Zero Trust Free is now activated. The operator Access application still needs to be created for the Worker hostname paths `operator` and `operator/*`, with Matt and `millerremodelingidaho@gmail.com` in the Allow policy. Wrangler's OAuth token does not include Access administration permissions.
- Operator allowlist: Matt's sign-in is known. Matt confirmed Erik currently uses `millerremodelingidaho@gmail.com`; Erik's new Workspace account is not yet available.
- Google Calendar: the dedicated Google Cloud project `Miller website integration` was created. Calendar API enablement, OAuth branding/client, schedule calendar ID, Erik's consent, and actual project-reference readback remain outstanding. The OAuth callback is configured as `https://erik-miller-worker.matt-boyer.workers.dev/operator/google/callback`.
- Photos: the exact JobTread transfer destinations and connected upload/readback are still unverified.
- Website build: saved Pages variables take effect on the next build. This setup did not publish the local website changes or trigger a Pages rebuild.
- Operational notifications and connected end-to-end tests remain open. Final design/content/images and the single production review still precede launch.

See [the account setup guide](connect-accounts.md) for screen locations and [functional launch](functional-launch.md) for test and recovery expectations. No secrets or private JobTread IDs are recorded here.
