# Miller Remodeling SDD Profile

## Work-item identity

- Provider: local; external item not required.
- Metadata label: Work item.
- Human-assigned story keys: `MR-[0-9]+`; lowercase filenames. These are examples of the pattern, not assigned keys.
- PRD `WS-0` through `WS-9` labels are workstreams. Ask for a human-assigned story key; do not invent one.
- Read adapter: local approved artifacts. Write adapter: none.

## Artifact paths

Use the shared default epic, story, QA, spec, work-package, release-spec, review, stakeholder-review, and release-plan paths.
- Brief: `docs/product/briefs/prd-2026-10-01.md` (unchanged Draft source).
- Brand: `docs/brand/branding-kit-2026-10-01.md` (unchanged Draft source).
- ADR directory: `docs/architecture/decisions/`.
- Bootstrap evidence: `docs/project/bootstrap.md`; not an approved WS-0 spec.

## Repository discovery

- Orientation: `AGENTS.md`, `README.md`, `PLACEHOLDERS.md`, `docs/project/bootstrap.md`.
- Manifests: root/workspace `package.json`, `package-lock.json`, Astro/Wrangler config.
- Source: `apps/web/src`, `apps/worker/src`; shared code in `packages/` only as needed.
- Tests: `apps/worker/test`, `scripts/test`.
- Infrastructure: `.github/workflows`, `apps/worker/wrangler.jsonc`.
- Generated boundaries: `node_modules`, `dist`, `dist-production-check`, `.astro`, `.wrangler`, `.lighthouseci`.

## Verification

- Node 24+, npm lockfile.
- Unit/guard tests: `npm test`.
- Static analysis: `npm run lint`, `npm run typecheck` (includes `astro check`).
- Skill validation: `npm run skills:validate`.
- Review site + Worker dry-run: `npm run build`.
- All-direction production isolation: `npm run check:production`.
- Aggregate: `npm run check`.
- Browser performance: `npm run lighthouse`; Chrome required. Mobile perf/a11y/best practices/LCP enforced in CI; SEO warning while preview is deliberately noindex.
- JobTread contract/E2E suites: not implemented; approved WS-2/WS-3 work owns them. No coverage threshold yet.

## Tool adapters

| Capability | Adapter | Access | Authorization | Fallback |
|---|---|---|---|---|
| work-item.read | local Markdown | Read | Task scope | Supplied artifact |
| knowledge.read | local source documents | Read | Task scope | Report missing source |
| pull-request.write | available GitHub/CLI | Write | Explicit user request | Draft Markdown |
| ci.read | local workflow/available remote CI | Read | Task scope | Local evidence |
| release.write | Wrangler/BIS test account | Write | Explicit deployment instruction + credentials | Local build/runbook |

## Workflow extensions

No new core phase. Preserve the shared lifecycle. PRD requires Erik's site/wizard/review-copy approval, explicit launch authorization, and production verification. WS-2, WS-3, WS-4, WS-6 require adversarial review. Any Open root placeholder blocks production.
