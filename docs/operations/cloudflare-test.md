# Provision the test deployment

Prepared for Matt/BIS; no remote account/repository/deployment was created during bootstrap.

1. Confirm BIS GitHub org/repo and Cloudflare account. Keep DNS at Porkbun.
2. Create a Direct Upload Pages project `miller-remodeling-test`, primary branch `main`. The Pages production-branch term refers only to this isolated test project. Do not attach the business domain or mix Git integration with the CI upload path.
3. Create a GitHub `test` environment with secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Restrict token permissions to required Pages/Worker deployment in the BIS account.
4. Set repository variable `CLOUDFLARE_PAGES_PROJECT=miller-remodeling-test`. Set `ENABLE_TEST_DEPLOYS=true` only after authorization. Otherwise deployment remains off.
5. Authorize push. CI verifies before uploading `apps/web/dist` and deploying the test Worker. Same-repository PRs get Pages previews; forks get checks without secrets.
6. Capture returned URLs, 200 `/health`, draft A/B/C behavior, mobile layout, and PR preview evidence. Only then close infrastructure placeholders. Adding a test custom domain requires a separate DNS instruction.

The health scaffold requires no secrets. WS-2 will introduce approved intake secrets through Wrangler secret storage. Preview remains noindex through HTML, robots.txt, and headers. Private stakeholder content may require Cloudflare Access.

## What Matt should configure

Cloudflare and GitHub accounts exist, and Matt has the JobTread API key (confirmed 2026-10-01). These instructions do not require sending secret values in chat.

| Name | Where | Value / purpose |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | GitHub repository → Settings → Environments → `test` → Environment secrets | Custom Cloudflare token scoped to the BIS account, with Cloudflare Pages Edit and Workers Scripts Edit for the current deployment workflow |
| `CLOUDFLARE_ACCOUNT_ID` | Same GitHub `test` environment, as a secret to match existing CI | Account ID from the intended Cloudflare account; this is an identifier, not an API key |
| `CLOUDFLARE_PAGES_PROJECT` | GitHub repository → Settings → Secrets and variables → Actions → Variables | `miller-remodeling-test`, matching the Direct Upload Pages project |
| `ENABLE_TEST_DEPLOYS` | Same repository Variables | Keep `false` until test deployment is authorized; `true` enables the existing workflow |
| JobTread API key | Future intake Worker's runtime secret, never the static Pages build | Keep it with Matt until the WS-2 contract names its binding and the intended JobTread test data boundary is approved |

Create the token in Cloudflare's API Tokens settings using a custom token and select only the intended account. The current health Worker uses `workers.dev`, so this workflow does not need DNS-edit or custom-domain route permissions. Grant additional access only if a later approved deployment requires it.

Create the GitHub `test` environment if absent, then use **Add secret** for the two entries above. Creating these entries alone does not deploy anything. The workflow already reads them; no JobTread key belongs in those static-site build steps.

When approved intake work defines the secret binding, add it to the selected Worker through Cloudflare → Workers & Pages → Worker → Settings → Variables and Secrets, choosing a secret. Alternatively, from `apps/worker`, run `npx --no-install wrangler secret put <APPROVED_BINDING_NAME>` and enter the value at its prompt. Wrangler secret commands can update a live Worker; use them only at that authorized step. The current test Worker is `miller-remodeling-intake-test` and its health endpoint does not use the key.

For approved local intake work, Wrangler reads an untracked `apps/worker/.dev.vars` alongside its configuration. This repository ignores `.dev.vars` and `.env` files. Do not commit values, put them in `PUBLIC_...` variables, or use production customer data for development verification. Notification and scheduling credentials will be listed after their providers are selected.

Sources: [GitHub environment secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets), [Pages API token permissions](https://developers.cloudflare.com/pages/configuration/api/), [Cloudflare API token permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/), [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

## Scheduler investigation

Start by checking JobTread's native capabilities with Matt/Erik before provisioning Calendly or another booking account. Its [scheduling feature page](https://www.jobtread.com/features/tasks-and-scheduling) documents project tasks, schedules, and external calendar sync. That evidence does not establish public availability-based consultation booking. Verify homeowner self-booking, timezone/buffer rules, conflict prevention, reminders, cancellation/rescheduling, and API-linked lead/job appointments against the intended account. Record capability gaps before selecting a provider.

References: [Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) and [Wrangler Pages commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/).
