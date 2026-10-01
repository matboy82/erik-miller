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

`check` validates skills, lints, typechecks, tests, builds both workspaces, and verifies review-control/token isolation for all three production directions. Lighthouse requires Chrome.

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

`npm run build` produces the draft review build. `npm run build:production` requires `docs/brand/brand-lock.json` containing `direction` (`A`, `B`, or `C`), `approvedBy`, `approvedOn`, and `adr`, recorded after Erik's approval. Bootstrap creates no brand lock. A build is not release authorization: resolve placeholders and finish SDD/stakeholder/release gates first. Even verification builds remain noindex.
