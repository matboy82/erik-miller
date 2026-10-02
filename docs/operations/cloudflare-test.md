# Provision the test deployment

Prepared for Matt/BIS; no remote account/repository/deployment was created during bootstrap.

1. Confirm BIS GitHub org/repo and Cloudflare account. Keep DNS at Porkbun.
2. Create a Direct Upload Pages project `erik-miller`, primary branch `main`. The Pages production-branch term refers only to this isolated test project. Do not attach the business domain or mix Git integration with the CI upload path.
3. Create a GitHub `test` environment with secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Restrict token permissions to required Pages/Worker deployment in the BIS account.
4. Set repository variable `CLOUDFLARE_PAGES_PROJECT=erik-miller`. Set `ENABLE_TEST_DEPLOYS=true` only after authorization. Otherwise deployment remains off.
5. Authorize push. CI verifies before uploading `apps/web/dist` and deploying the test Worker. Same-repository PRs get Pages previews; forks get checks without secrets.
6. Capture returned URLs, 200 `/health`, draft A/B/C behavior, mobile layout, and PR preview evidence. Only then close infrastructure placeholders. Adding a test custom domain requires a separate DNS instruction.

The health scaffold requires no secrets. WS-2 will introduce approved intake secrets through Wrangler secret storage. Preview remains noindex through HTML, robots.txt, and headers. Private stakeholder content may require Cloudflare Access.

## MR-01 deployment contract

The [accepted deployment ADR](../architecture/decisions/0002-test-deployment-isolation.md) governs this workflow. Confirm the BIS repository, Cloudflare account, and intended test project before enabling the flag. Use only public Draft material; noindex does not restrict access.

`verify` checks out the event revision with read-only permissions and runs installation, aggregate checks, and mobile Lighthouse without Cloudflare credentials. `test-deploy` requires successful verification, the enabled flag, and either a main push or a same-repository PR. It rebuilds the same revision without secrets. Only the final `scripts/test-deployment.mjs` step receives the Cloudflare credentials and a read-only GitHub token for current-main verification. The deployment script repeats event/configuration checks before publication and scans every shipped file for credential values without printing them.

Main publishes the persistent Pages branch and `erik-miller`. Same-repository PRs publish to `pr-<number>` and never deploy the Worker. Fork PRs receive verification only. Treat same-repository contributors as trusted: configure required reviewers for the `test` environment if that trust is insufficient. Never enable privileged PR-target execution. Disable deployment while changing trust or permissions.

Persistent deployments share a concurrency group with cancellation of running publication disabled. The deployment script checks the current main SHA before Pages and again before Worker publication; stale or unreadable revisions fail closed. Each PR uses its own concurrency group. Do not assume a running deployment is cancelled when a newer revision appears.

The script captures Wrangler output in memory and writes only sanitized revision, test URLs, and resource outcomes to the run summary. It checks the unique Pages URL and, for main, the persistent Pages URL for successful HTTPS responses, robots meta, disallow rules, and noindex headers. It independently checks the published Worker's scaffold payload and no-store health response. HTTP redirects, failed checks, and partial publication fail the job. A failed job may already have updated Pages; disable the flag and record the resource outcome before an explicitly authorized recovery deployment. URLs come from actual publication, never from an assumed successful run.

## Evidence and authorization handoff

Before P3, Matt supplies the confirmed repository/project/account boundary and restricted secrets through GitHub settings, then explicitly authorizes required configuration, push, test publication, and deliberate failing-check runs. Do not paste secret values into chat or documents. Repository approval alone does not grant those actions.

Capture every F2 branch: disabled passing main; enabled passing main; enabled failing verification; enabled passing same-repository PR; and fork PR verification with deployment skipped. For each, record event, tested/PR-head revision, run/job links and states, and actual test URLs where publication occurred. Inspect conditions and environment access without exposing secrets. Local guard tests and synthetic HTTP responses cannot replace this remote evidence.

Retain full local command logs and individual Lighthouse reports with versions, OS, effective mobile settings, three-run aggregation, revision, and uncommitted patch. The strict LCP gate rejects equality at 2,500ms; SEO remains a warning on noindex previews. Record F1–F4 outcomes in [MR-01 verification](../project/mr-01-verification.md). Infrastructure closure also requires confirmed environment and branch-protection evidence under the placeholder register. Keep unrelated entries, including RELEASE-01, Open.

After implementation, hand the approved artifacts, repository instructions, changed files, raw diff, and verification output to a fresh review session without the implementation conversation. Record code-review and required adversarial verdicts in `docs/specs/website-lead-qualification/mr-01.review.md`; this runbook grants no review verdict or release approval.

## What Matt should configure

Cloudflare and GitHub accounts exist, and Matt has the JobTread API key (confirmed 2026-10-01). These instructions do not require sending secret values in chat.

| Name | Where | Value / purpose |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | GitHub repository → Settings → Environments → `test` → Environment secrets | Custom Cloudflare token scoped to the BIS account, with Cloudflare Pages Edit and Workers Scripts Edit for the current deployment workflow |
| `CLOUDFLARE_ACCOUNT_ID` | Same GitHub `test` environment, as a secret to match existing CI | Account ID from the intended Cloudflare account; this is an identifier, not an API key |
| `CLOUDFLARE_PAGES_PROJECT` | GitHub repository → Settings → Secrets and variables → Actions → Variables | `erik-miller`, matching the Direct Upload Pages project |
| `ENABLE_TEST_DEPLOYS` | Same repository Variables | Keep `false` until test deployment is authorized; `true` enables the existing workflow |
| JobTread API key | Future intake Worker's runtime secret, never the static Pages build | Keep it with Matt until the WS-2 contract names its binding and the intended JobTread test data boundary is approved |

Create the token in Cloudflare's API Tokens settings using a custom token and select only the intended account. The current health Worker uses `workers.dev`, so this workflow does not need DNS-edit or custom-domain route permissions. Grant additional access only if a later approved deployment requires it.

Create the GitHub `test` environment if absent, then use **Add secret** for the two entries above. Creating these entries alone does not deploy anything. The workflow already reads them; no JobTread key belongs in those static-site build steps.

When approved intake work defines the secret binding, add it to the selected Worker through Cloudflare → Workers & Pages → Worker → Settings → Variables and Secrets, choosing a secret. Alternatively, from `apps/worker`, run `npx --no-install wrangler secret put <APPROVED_BINDING_NAME>` and enter the value at its prompt. Wrangler secret commands can update a live Worker; use them only at that authorized step. The current test Worker is `erik-miller` and its health endpoint does not use the key.

For approved local intake work, Wrangler reads an untracked `apps/worker/.dev.vars` alongside its configuration. This repository ignores `.dev.vars` and `.env` files. Do not commit values, put them in `PUBLIC_...` variables, or use production customer data for development verification. Notification and scheduling credentials will be listed after their providers are selected.

Sources: [GitHub environment secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets), [Pages API token permissions](https://developers.cloudflare.com/pages/configuration/api/), [Cloudflare API token permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/), [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

## Scheduler investigation

Start by checking JobTread's native capabilities with Matt/Erik before provisioning Calendly or another booking account. Its [scheduling feature page](https://www.jobtread.com/features/tasks-and-scheduling) documents project tasks, schedules, and external calendar sync. That evidence does not establish public availability-based consultation booking. Verify homeowner self-booking, timezone/buffer rules, conflict prevention, reminders, cancellation/rescheduling, and API-linked lead/job appointments against the intended account. Record capability gaps before selecting a provider.

References: [Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) and [Wrangler Pages commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/).

Concurrency mechanics: [GitHub job concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency), read 2026-10-01. Official documentation supports platform behavior; the remote matrix still needs actual execution.
