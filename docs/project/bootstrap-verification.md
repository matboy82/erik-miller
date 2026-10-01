# Bootstrap verification - 2026-10-01

Local foundation and skill conversion verified. This is implementation evidence, not an independent code/adversarial verdict or a release approval.

| Check | Observed result |
|---|---|
| `npm install --no-audit --no-fund` | Pinned dependencies installed; lockfile generated |
| `npm run check` | Exit 0: skill links, lint, Astro/Worker typechecks, four tests, static build, Worker dry-run, production A/B/C isolation |
| Official `skill-creator/scripts/quick_validate.py` over every converted skill | `Official validator: 29 passed; 0 failed` |
| `npm run skills:validate` | `Validated 29 Codex skills and their Markdown references.` |
| `npm test` after strengthening production guard | Four tests passed, zero failed |
| `npm run check:production` | `Production isolation passed` for A, B, C; no toolbar markup/CSS, theme switching, or alternate token sets |
| Headless browser smoke on local preview | A/B/C colors/copy, tagline choice, reload persistence, mobile selector bounds, no horizontal overflow or JS errors |
| Local Wrangler `GET /health` | 200; `{"status":"ok","service":"miller-remodeling-intake","stage":"scaffold"}` |
| `npm run lighthouse` with local headless Edge | Three mobile runs; performance 100, accessibility 100, best practices 96, SEO 63; LCP about 1.06 seconds |
| Supplied source-document byte comparison | Both exact copies; source Draft status unchanged |
| `git diff --check` | Exit 0; all project files remain uncommitted/untracked |

SEO is intentionally a warning for this draft: HTML/headers/robots.txt prevent indexing. The final site still requires approved WS-1 SEO work and launch QA; these measurements are for the scaffold, not future pages or lead flows. Lighthouse reports are ignored under `.lighthouseci/reports`.

## Environment and compatibility

Verification host: Windows, Node 26.9.0, npm 12.1.0. CI is configured for Node 24; no remote CI run was executed. Wrangler's bundler needed elevated local access because the Windows sandbox blocked parent-directory discovery. Its successful command was `wrangler deploy --dry-run`: no remote deployment occurred.

TypeScript is pinned to 6.0.3 because the lint toolchain does not support 7 yet. The web workspace directly pins `cookie` 2.0.1 to keep Astro's generated prerender code from resolving Lighthouse/Express's older hoisted copy. Astro telemetry is disabled by the local command wrapper; build logs remain in the workspace.

The official skill validator used PyYAML installed only under ignored `.tmp/skill-validator`. Product checks need Node/npm, not Python. Browser smoke profiles/screenshots are also ignored temporary artifacts. Role constraints are instructions, not Codex tool-permission configuration.

## Not verified or performed

No GitHub push/PR/remote CI, Cloudflare provisioning/public deploy, DNS change, production release, source-ADR retrieval, final brand approval, JobTread contract/live call, lead submission, booking, notifications, or analytics integration. Those remain recorded in `PLACEHOLDERS.md` and the draft runbooks. Full WS-0 acceptance and later workstreams remain gated.
