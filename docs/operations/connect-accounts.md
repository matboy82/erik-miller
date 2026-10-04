# Connect Cloudflare, JobTread, and Google Calendar

For Matt and Erik. Updated 2026-10-03. These instructions configure the integration for testing; the business website goes live after the final review.

**Start with step 1. Wrangler commands run in PowerShell on Matt's computer. There is no place to run them inside the R2 bucket screen.**

You handle account sign-ins, Google consent, and Erik's scheduling preferences. Once Cloudflare sign-in works, Codex can handle the resource checks, migrations, existing JobTread credentials/IDs, and integration configuration. You do not need to find technical JobTread IDs yourself.

## 1. Open PowerShell and sign in to Cloudflare

**Where:** On your Windows computer, open Start, type **PowerShell**, and open it. Keep that window open for commands in this guide. Paste each line and press Enter:

```powershell
Set-Location 'C:\Users\Matt\Desktop\workspace\erik-miller'
npx --no-install wrangler login
```

A browser opens. Sign in to the Cloudflare account that contains your R2 bucket and Worker, approve Wrangler's access request, and return to PowerShell. Then run:

```powershell
npx --no-install wrangler whoami
```

**Success:** PowerShell lists your Cloudflare account. Signing into Cloudflare in a browser alone does not sign in Wrangler. [Cloudflare login instructions](https://developers.cloudflare.com/workers/wrangler/commands/general/).

If the browser does not open, copy the login URL printed in PowerShell into your browser. If `npx` is not recognized, Node.js/npm are not available in that terminal; close and reopen PowerShell after installing the project's supported Node version. They are already installed in this workspace's environment. If Wrangler is missing, run `npm ci` from the same folder, then retry. Do not create a new Cloudflare project or install another copy of this repository.

**You can stop doing command-line setup here and let Codex handle steps 2–3 once authentication works.** The commands below are provided so every step is clear and reproducible.

## 2. Confirm the storage resources

**Where:** [Cloudflare dashboard](https://dash.cloudflare.com/), in the same account used in step 1. Use the dashboard search if a left-menu group is collapsed.

| Resource | Where to look | Expected name |
|---|---|---|
| Photo bucket | R2 Object Storage → bucket list | `miller-intake-photos` |
| Inquiry database | D1 → database list | `miller-remodeling-intake` |
| Delivery queue | Queues → queue list | `miller-intake-delivery` |
| Failed-delivery queue | Queues → queue list | `miller-intake-dead-letter` |

You have already created the R2 bucket. Open it → **Settings** and check that the public development URL is disabled and no public custom domain is connected. Homeowner photos must stay private. No R2 API key is needed: the Worker accesses the bucket through its configured binding. [R2 public-access settings](https://developers.cloudflare.com/r2/buckets/public-buckets/).

If your bucket has a different name, tell Codex the name so `apps/worker/wrangler.jsonc` can point to it. Do not create another bucket just to match this guide.

For the queues, first run this in **PowerShell**:

```powershell
npx --no-install wrangler queues list --config apps/worker/wrangler.jsonc
```

Only if a named queue is missing, create that queue with the corresponding line:

```powershell
npx --no-install wrangler queues create miller-intake-delivery --config apps/worker/wrangler.jsonc
npx --no-install wrangler queues create miller-intake-dead-letter --config apps/worker/wrangler.jsonc
```

The repository already defines the queue connections; the integration deployment applies them. [Queue creation and bindings](https://developers.cloudflare.com/queues/get-started/).

The D1 database is already referenced by ID in the configuration. If it is absent from your account, let Codex reconcile the account/database ID before creating a replacement.

## 3. Create the database tables

**Where:** The same **PowerShell** window, still in the repository folder:

```powershell
npx --no-install wrangler d1 migrations apply INTAKE_DB --remote --config apps/worker/wrangler.jsonc
```

If Wrangler asks to apply the listed migrations, confirm. This creates the inquiry, photo, booking, and calendar-sync tables in the configured Cloudflare database. It does not publish the website or create JobTread records.

**Success:** All pending migrations are applied, or Wrangler says there are none left. `--remote` means the Cloudflare database; `--local` would only change a test database on your computer. A database-not-found error means the account/ID needs checking. [D1 migration commands](https://developers.cloudflare.com/d1/wrangler-commands/).

## 4. Find the Worker and the website separately

**Where:** Cloudflare → **Workers & Pages**.

- Open the Worker named **`erik-miller-worker`**. This name comes from the current repository configuration. Copy its deployed HTTPS URL from its overview or Settings → Domains & Routes. Call this the **Worker URL** throughout this guide.
- Open the **Pages** project serving the website, expected to be `erik-miller-web` if it was created with the earlier guide. Copy its stable `pages.dev` URL. Call this the **website URL**. Use the actual project's name if it differs.

Example formats only: `https://erik-miller-worker.YOUR-SUBDOMAIN.workers.dev` and `https://YOUR-PAGES-PROJECT.pages.dev`. Replace them with the real URLs; do not paste these examples as settings.

If Cloudflare shows only the older `erik-miller` Worker, let Codex reconcile its name with the configuration. If `/operator/` returns 404, the new integration code has not been deployed to that Worker yet. Creating the bucket does not deploy the code. We will deploy the integration candidate for connection tests while keeping the business launch for your final review.

## 5. Create the form security keys

**Where:** Cloudflare → **Turnstile** → **Add widget**.

1. Name it `Miller website forms`.
2. Under hostname management, add the website hostname, such as `YOUR-PAGES-PROJECT.pages.dev`. Enter only the hostname, without `https://` or a path. Add the final business hostname when it is ready to use.
3. Select **Managed** mode and create the widget.
4. Keep the **sitekey** and **secret key** available for the next two steps.

The sitekey belongs in the website build. The secret key belongs in the Worker. [Turnstile widget setup](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/).

## 6. Add Worker settings

**Where:** Cloudflare → Workers & Pages → **`erik-miller-worker`** → **Settings** → **Variables and Secrets** → **Add**.

Choose **Text** for ordinary settings and **Secret** for credentials. Enter the exact name in the left column and the value in the right column. Save/deploy the settings as prompted. Use the runtime settings section, not the separate variables under **Build**. [Worker secret setup](https://developers.cloudflare.com/workers/configuration/secrets/).

The repository now sets `keep_vars=true` so later Wrangler deployments preserve dashboard text settings. This takes effect when the updated configuration is used for deployment. [Wrangler variable preservation](https://developers.cloudflare.com/workers/wrangler/configuration/).

| Name | Type | Value / who supplies it |
|---|---|---|
| `INTAKE_ENABLED` | Text | `false` during setup; Codex enables it for the connected test |
| `BOOKING_SYNC_ENABLED` | Text | `false` until the calendar/reference test passes |
| `ALLOWED_ORIGINS` | Text | Exact website URL, including `https://`, with no trailing slash; comma-separated if several |
| `TURNSTILE_SECRET_KEY` | Secret | Secret key from step 5 |
| `JOBTREAD_API_KEY` | Secret | Existing private key supplied to this workspace; Codex can install it |
| `JOBTREAD_ORGANIZATION_ID` | Text | Codex supplies the verified organization ID |
| `JOBTREAD_EMAIL_CUSTOM_FIELD_ID` | Text | Codex supplies the existing customer-contact email field ID |
| `JOBTREAD_PHONE_CUSTOM_FIELD_ID` | Text | Codex supplies the existing customer-contact phone field ID |
| `JOBTREAD_TRANSFER_ORIGINS` | Text | Codex verifies the exact upload/download destinations during the photo connection test |
| `ACCESS_TEAM_DOMAIN` | Text | Team hostname from step 7, without `https://` |
| `ACCESS_AUD` | Text | Application Audience tag from step 7 |
| `OPERATOR_EMAILS` | Text | Matt's and Erik's exact sign-in email addresses, separated by a comma |
| `GOOGLE_CLIENT_ID` | Text | Client ID from step 8 |
| `GOOGLE_CLIENT_SECRET` | Secret | Client secret from step 8 |
| `GOOGLE_OAUTH_REDIRECT_URI` | Text | Worker URL followed by `/operator/google/callback` |
| `GOOGLE_BOOKING_CALENDAR_ID` | Text | Calendar ID from step 9 |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | Secret | Generated below; Codex can generate/install it |

Leave `INTAKE_MODE` unset on the deployed Worker. `synthetic` is only for local tests. Leave `GOOGLE_REFRESH_TOKEN` unset when using the Connect button in step 10; the connection stores the token automatically.

If you generate the encryption key yourself, run this in **PowerShell** and copy its output directly into the `GOOGLE_TOKEN_ENCRYPTION_KEY` Secret field:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Keep that key stable after connecting Google; changing it makes the stored token unreadable. No credentials belong in Pages `PUBLIC_...` settings or in chat.

## 7. Protect the operator page

**Where:** Cloudflare → **Zero Trust** → **Access controls** (called **Access** in some navigation layouts) → **Applications**.

1. If this is your first Zero Trust setup, create the team and note its `YOUR-TEAM.cloudflareaccess.com` hostname.
2. Create a self-hosted application named `Miller operator`.
3. Add your Worker hostname with path `operator`, plus the same hostname with path `operator/*`, in the same application. Both the page and all its subroutes, including the Google callback, need protection.
4. Add an **Allow** policy with **Include → Emails** containing Matt's and Erik's exact addresses. Use an available sign-in method; email one-time PIN avoids needing another Google login integration.
5. Save the application. Open its details and copy **Application Audience (AUD) Tag** into `ACCESS_AUD` from step 6. Put the team hostname into `ACCESS_TEAM_DOMAIN`, and the same two addresses into `OPERATOR_EMAILS`.

Use path-based protection here. Enabling **Protect this Worker** for all traffic would also require homeowners to sign in before submitting the public forms. [Access for Worker paths](https://developers.cloudflare.com/workers/configuration/cloudflare-access/), [path matching](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/).

**Success:** Opening the Worker URL plus `/operator/` asks for a permitted sign-in and then shows the setup checks. The page is part of this Worker; you do not create a separate website for it. A 403 after sign-in means the audience, team hostname, or email allowlist needs checking.

## 8. Create Google's calendar connection credentials

**Where:** [Google Cloud Console](https://console.cloud.google.com/), using an account that can manage a project for Erik's business. This is different from the Google Calendar website.

1. Select or create a project named `Miller website integration` using the project selector at the top.
2. Open **APIs & Services → Library**, search **Google Calendar API**, and enable it.
3. Open **Google Auth Platform → Branding** and complete the setup: app name `Miller website integration`, a real support email, and a contact email.
4. In **Audience**, choose **Internal** only if the project and Erik's account belong to the same Google Workspace organization. Otherwise choose **External** and add the account that will authorize Erik's calendar under **Test users** for the connection test.
5. In **Data Access**, add only `https://www.googleapis.com/auth/calendar.events.readonly`.
6. In **Clients → Create client**, choose **Web application**. Name it `Miller calendar connector`. Under **Authorized redirect URIs**, add the exact Worker URL plus `/operator/google/callback`. There is no trailing slash after `callback`.
7. Create the client. Copy its Client ID and Client secret into the corresponding Worker settings in step 6. Copy the same callback URL into `GOOGLE_OAUTH_REDIRECT_URI`.

This is a server connection, so no separate Google API key or browser JavaScript origin is required. [Google OAuth console setup](https://developers.google.com/workspace/calendar/api/quickstart/js), [server OAuth flow](https://developers.google.com/identity/protocols/oauth2/web-server).

**Before launch:** External apps in Testing receive refresh tokens that expire after seven days for this Calendar scope. We must resolve the production publishing/verification requirements and reconnect before relying on unattended sync. An initial successful connection is not proof that it will keep working after a week. [Google token limits](https://developers.google.com/identity/protocols/oauth2).

## 9. Configure Erik's appointment schedule

**Where:** [Google Calendar](https://calendar.google.com/), in a desktop browser, signed in as Erik or the schedule owner.

1. Open Erik's existing appointment schedule and select its edit/pencil control. In the schedule settings, note which calendar receives appointments. Keep that calendar; creating a separate calendar alone does not move the schedule.
2. In the booking-page settings, open **Booking form → Add an item**. Add a custom question named **Project reference** and mark it required. Save the schedule.
3. Confirm the selected location is the intended phone call or in-person meeting. Confirm America/Denver timezone, duration, availability, buffers, reminders, and cancellation/rescheduling settings with Erik.
4. Open the schedule's booking page/share control and copy its public booking link for `PUBLIC_BOOKING_URL` in step 11.
5. In Calendar, open **Settings → Settings for my calendars → the calendar receiving those appointments → Integrate calendar**. Copy **Calendar ID** into the Worker's `GOOGLE_BOOKING_CALENDAR_ID`. This is not the booking-page URL or the calendar's public embed URL.

Google's available scheduling features depend on Erik's account. [Booking-page settings](https://support.google.com/calendar/answer/10729749?hl=en), [where to find the Calendar ID](https://support.google.com/calendar/answer/44105?hl=en).

**Codex's connection test:** Submit a test project, copy its receipt reference into a test booking, and verify that Google's API event description contains that exact reference. This check is still outstanding. Do not assume the custom answer is available to the API just because the question appears on the form.

## 10. Let Erik authorize the calendar

**Where:** In a browser, open the actual Worker URL plus **`/operator/`** after the integration candidate is deployed and steps 3, 6–9 are complete.

1. Sign in through Cloudflare Access as Matt or Erik.
2. Click **Connect Erik's Google booking calendar**.
3. In Google's account chooser, select the Google account that has access to the booking calendar. Erik completes consent for reading calendar events.
4. Return to the operator page and check the connection status. Codex then verifies calendar reads and the reference test before setting `BOOKING_SYNC_ENABLED=true`.

Normal booking synchronization runs automatically every five minutes once enabled. Erik does not need to open the operator page for each appointment. That page is for setup and recovery.

If Google reports `redirect_uri_mismatch`, compare the callback in the Google client and Worker setting character for character. If Google denies access while the app is in Testing, confirm the selected account is listed as a test user (or is eligible for Internal access).

## 11. Add the website's public settings

**Where:** Cloudflare → **Workers & Pages → the website's Pages project → Settings → Variables and Secrets**. Some Pages layouts label this **Environment variables**. Add these to the environment serving the review website:

| Name | Value |
|---|---|
| `PUBLIC_INTAKE_API_URL` | Actual Worker URL, with no `/intake` suffix and no trailing slash |
| `PUBLIC_TURNSTILE_SITE_KEY` | Sitekey from step 5 |
| `PUBLIC_BOOKING_URL` | Public schedule link from step 9 |
| `SITE_BUILD` | `review` while design/content review continues |
| `NODE_VERSION` | `24.15.0` |

Pages' **Production** environment means its persistent branch deployment; it does not mean we have launched the business domain. Set Preview values too if trusted previews need working forms, and explicitly allow their website origins in the Worker/Turnstile settings. Arbitrary preview URLs are not automatically allowed.

Save, then rebuild/redeploy that Pages project after the integration candidate code is available. These values are read when the site is built, so changing settings alone does not update an existing build. [Pages build environment settings](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## 12. Finish the engineering checks before launch

**Codex handles:** Verified JobTread IDs/key installation, exact photo transfer destinations, deployment bindings, connected test inquiries/photos/bookings, duplicate/recovery checks, and release evidence. You handle the sign-ins/consent and Erik's schedule decisions.

**Alerts still need engineering work.** The code emits failure events, but it does not yet send operational email notifications. There is no application-specific alert toggle in the R2 bucket to complete this step. We must configure a notification destination and prove delivery for `intake_dead_letter`, `intake_delivery_ambiguous`, `intake_pending_over_24h`, `intake_cleanup_failed`, `booking_sync_failed`, and `booking_delivery_pending`.

Account creation alone does not establish that the integration is connected. Use the operator setup checks plus the connected tests in [functional launch](functional-launch.md#test-before-the-single-production-review). Complete the single review before attaching the final business domain and enabling the public launch.
