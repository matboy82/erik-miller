# Miller Remodeling

Static-first website and lead qualification system for Miller Remodeling LLC in the Treasure Valley. Bootstrap includes a draft design review page and a health-check Worker. Intake, JobTread, booking, and portfolio publishing are future approved work.

## Run locally

Use Node 24+ and npm, from the repository root:

```sh
npm ci
npm run dev
```

Site: `http://127.0.0.1:4321`. In another terminal, run `npm run dev:worker`; health: `http://127.0.0.1:8787/health`.

```sh
npm run check
npm run lighthouse
```

`check` validates skills, lints, typechecks, tests, builds both workspaces, and verifies complete production brand isolation for A/B/C and a mixed copy/tagline selection. Lighthouse requires Chrome. The review toolbar lets you select visual direction, hero/process copy, and tagline independently. See [brand review and approval](docs/operations/brand-review.md).

`lighthouse` measures the review home page three times with mobile settings, retains individual reports under `.lighthouseci`, and enforces scores ≥90 and optimistic LCP strictly below 2,500ms. Equality fails. See the [accepted frontend ADR](docs/architecture/decisions/ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md), [bootstrap reconciliation](docs/architecture/decisions/0001-bootstrap-foundation.md), and [test deployment decision](docs/architecture/decisions/0002-test-deployment-isolation.md). Cloudflare Git integration publishes the web and Worker apps separately; GitHub Actions runs verification only. See the [Cloudflare setup steps](docs/operations/cloudflare-test.md). The health Worker proves test infrastructure; production intake hosting remains a WS-2 decision.

## Layout

- `apps/web`: Astro 7, React integration, TypeScript, static output, self-hosted fonts.
- `apps/worker`: Cloudflare Worker health scaffold.
- `packages`: shared code boundary, empty until needed.
- `.agents/skills`: native Codex workflows and specialist roles.
- `.claude`: preserved original toolkit.
- `docs/product/briefs` and `docs/brand`: exact supplied draft documents.

Read [bootstrap scope](docs/project/bootstrap.md), [placeholders](PLACEHOLDERS.md), [Cloudflare setup](docs/operations/cloudflare-test.md), and [cutover plan](docs/operations/dns-cutover.md).

## Codex

Read [AGENTS.md](AGENTS.md) and [the workflow guide](docs/how-to/codex-workflow.md). Invoke `$atlas-sdd` to find the current gate or `$sdd-epic` to plan from the brief. Role skills do not automatically launch subagents.

## Production

`npm run build` produces the draft review build. `npm run build:production` requires a version-1 `docs/brand/brand-lock.json` with visual/copy directions, tagline ID, Erik's approval identity/date, and a matching Accepted brand-choice ADR with linked sign-off evidence. No real lock is created by bootstrap or MR-02. See the [schema and commands](docs/operations/brand-review.md). `node scripts/check-brand-lighthouse.mjs` measures each review direction using disposable source fixtures and retains separate reports. A build is not release authorization: resolve placeholders and finish SDD/stakeholder/release gates first. Even verification builds remain noindex.
