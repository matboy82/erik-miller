# Deploy the test apps with Cloudflare Git integration

Cloudflare builds and deploys both apps from matboy82/erik-miller. GitHub Actions runs verification only. No GitHub Cloudflare token, account secret, project variable, test environment, or deployment flag is required by this workflow. Existing GitHub entries can remain unused.

The [accepted 0002 amendment](../architecture/decisions/0002-test-deployment-isolation.md) records Matt's 2026-10-01 instruction to use Cloudflare's existing repository access. This guide replaces the GitHub Direct Upload setup. No remote settings or deployment were changed locally.

## 1. Push the repository changes

Commit and push the reviewed changes to main when authorized. Cloudflare builds the pushed revision, so local changes alone do not affect it. The new build:web and build:worker scripts target each workspace. The root .node-version selects Node 24.15.0 (the minimum Node 24 release supported by pinned npm 12.1.0); set NODE_VERSION=24.15.0 in Cloudflare if an existing override selects an older version.

## 2. Connect the website as a Pages project

In Cloudflare, open Workers & Pages, select Create application, choose Pages, and Connect to Git. Select the existing GitHub connection and matboy82/erik-miller. If you already have a Git-integrated Pages project, edit its build settings instead.

A Worker project is a separate resource and cannot act as the Pages destination. If you already created a Direct Upload Pages project, create a new Git-integrated Pages project with an available name; Direct Upload projects cannot switch to Git integration. Keep existing resources until the replacement is verified.

| Pages setting | Value |
|---|---|
| Project name | erik-miller-web (distinct from the erik-miller Worker) |
| Production branch | main |
| Framework preset | None (use the explicit command below) |
| Root directory | Leave blank: repository root |
| Build command | npm ci && npm run build:web |
| Build output directory | apps/web/dist |
| Build environment | NODE_VERSION=24.15.0 and SITE_BUILD=review, for persistent and preview builds |

Save and deploy. Pages handles publication; there is no Wrangler deploy command to enter here. Restrict preview deployments to trusted branches under branch deployment controls. Initially use main only if previews are not needed.

The Pages production-branch label means the persistent branch of this isolated test project. The review site remains Draft/noindex; do not attach the business domain or change DNS.

## 3. Configure the health Worker

Open the existing erik-miller Worker, then Settings > Build. Connect the same GitHub repository if it is not already connected. Its name must match erik-miller in apps/worker/wrangler.jsonc.

| Workers Builds setting | Value |
|---|---|
| Repository | matboy82/erik-miller |
| Production branch | main |
| Root directory | Leave blank: repository root |
| Build command | npm ci && npm run build:worker |
| Deploy command | npx --no-install wrangler deploy --config apps/worker/wrangler.jsonc |
| Build environment | NODE_VERSION=24.15.0 |
| Non-production branch builds | Disabled |

The explicit --config selects the Worker without running framework detection at the workspace root. Keeping installation at the repository root uses the shared pinned lockfile. The build command is a dry run; the deploy command publishes the Worker. Both commands are needed.

Use the deployment token managed by Workers Builds; Cloudflare creates one by default or lets you select an existing token. This authentication stays in Cloudflare and does not require GitHub Cloudflare secrets. Inspect its intended account and permissions in Cloudflare. The current health scaffold needs no application/runtime secret or JobTread key. Confirm the account has a workers.dev subdomain configured so the health Worker has a test URL.

Save the settings and retry the failed Worker build, or let the next main push trigger it. Leave build watch paths at their defaults initially so root lockfile/shared changes trigger both apps.

## 4. Confirm both deployments

After each main push, expect a Pages deployment, a separate Worker deployment, and a GitHub Verify run. Pages and Worker deploy independently. A failing GitHub check does not automatically prevent Cloudflare publication. A failed Cloudflare build prevents that app's new deployment.

Use the actual URLs returned by Cloudflare. Open the Pages site and confirm the draft controls/content. Check the page's robots meta, robots.txt disallow, and X-Robots-Tag noindex response header. Open the Worker's returned URL with /health appended; expect HTTP 200, Cache-Control: no-store, and the existing scaffold JSON. Confirm Worker code did not change when testing a Pages preview.

The old GitHub publication planner/uploader is removed. scripts/test-deployment.mjs contains read-only artifact/HTTP helpers for local tests; no automatic live check is wired to Cloudflare publication. Record real deployment revisions, build results, preview restrictions, URLs, and live responses in [MR-01 verification](../project/mr-01-verification.md). Local tests do not establish remote success. Keep infrastructure placeholders Open until their evidence requirements are met.

If a deployment fails or needs pausing, use that project's Cloudflare build controls and inspect active deployments. Disabling GitHub Verify does not stop Cloudflare publication. Each resource needs its own recovery deployment and live checks.

Sources: [Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [Pages monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/), [Pages Node version](https://developers.cloudflare.com/pages/configuration/build-image/), [Workers Builds settings and managed token](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Future intake credentials

When approved intake work defines the secret binding, add it to the selected Worker through Cloudflare → Workers & Pages → Worker → Settings → Variables and Secrets, choosing a secret. Alternatively, from `apps/worker`, run `npx --no-install wrangler secret put <APPROVED_BINDING_NAME>` and enter the value at its prompt. Wrangler secret commands can update a live Worker; use them only at that authorized step. The current test Worker is `erik-miller` and its health endpoint does not use the key.

For approved local intake work, Wrangler reads an untracked `apps/worker/.dev.vars` alongside its configuration. This repository ignores `.dev.vars` and `.env` files. Do not commit values, put them in `PUBLIC_...` variables, or use production customer data for development verification. Booking uses Erik's Google Calendar Appointment Schedule; its URL and owner-managed settings require no website API credential. Any later server-side JobTread association credential remains gated by its approved contract.


## Scheduler investigation

Matt confirmed on 2026-10-02 that JobTread does not provide the required homeowner self-booking flow. The current selection is Erik's Google Calendar Appointment Schedule, with phone and in-person options and no web conferences; this supersedes the earlier Calendly direction. Do not reopen native JobTread booking discovery. No Google account has been accessed, provisioned, or configured.

Erik configures and maintains the schedule in Google Calendar. Google documents phone call and in-person as supported appointment locations, along with availability, buffers and booking reminders; exact features depend on the Workspace subscription, and schedule creation is performed in a desktop browser. Confirm his actual entitlement, calendar conflict settings, duration, schedule mode, timezone, buffers, notice, cancellation/reminders and booking-page URL before implementation. The required appointment-to-JobTread association path remains Unverified and blocks production booking until tested. This guidance authorizes no account changes or booking setup. See [Accepted ADR 0005](../architecture/decisions/0005-jobtread-capability-verification-boundary.md), [Accepted ADR 0007](../architecture/decisions/0007-consultation-booking-integration-boundary.md), and [MR-04 evidence](../project/mr-04-verification.md).
