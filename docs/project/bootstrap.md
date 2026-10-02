# Local bootstrap - 2026-10-01

The user's request authorizes local project initialization and Claude-to-Codex skill conversion. This is not a completed WS-0 milestone or approval of later workstreams.

## Sources and scope

Exact byte copies of both supplied documents are under `docs/product/briefs` and `docs/brand`. Draft status/open decisions are unchanged. Embedded account/deploy instructions are reference material, not independent authorization. The separately referenced locked stack ADR was not attached; retrieve it before formal technical planning/production readiness.

Current deployment amendment (2026-10-01): Matt requested removal of the enable flag. Passing main pushes and same-repository PRs now deploy automatically after verification when the workflow is pushed and Cloudflare configuration is supplied. See [0002 amendment](../architecture/decisions/0002-test-deployment-isolation.md). The original bootstrap inventory below describes the earlier opt-in scaffold.

Current hosting amendment (2026-10-01): Cloudflare Git integration now owns separate Pages and Worker publication; GitHub Actions verifies only. Use build:web and build:worker from the repository root. This supersedes the earlier flag-removal/current-upload note above. No remote deployment is claimed.

Delivered locally: npm monorepo; Astro 7.3.5 static review page + React integration; TypeScript 6.0.3 supported by lint tooling; Node 24+; self-hosted fonts; A/B/C draft theme/copy toolbar; health Worker; CI and opt-in test deployment configuration; placeholder register and runbooks; 29 native Codex skills, shared contracts, and explicit rule references. Original Claude sources are preserved.

## Remaining milestone evidence

WS-0 still needs formal approved planning and external proof: remote CI, persistent test URL, live Worker, PR previews, secret-store verification, reviewed cutover runbook. No later intake/wizard/scheduler/CRM/CMS scope is implemented.

See `docs/project/bootstrap-verification.md` for actual check results. Local checks do not replace independent review, Erik's design approval, or release authorization.

## MR-01 current state — 2026-10-01

The [accepted source frontend ADR](../architecture/decisions/ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md) is now supplied. Matt approved the [MR-01 contract](../specs/website-lead-qualification/mr-01.spec.md), [0001 reconciliation](../architecture/decisions/0001-bootstrap-foundation.md), and [0002 test deployment decision](../architecture/decisions/0002-test-deployment-isolation.md). Earlier missing-source statements describe the original bootstrap baseline.

The Lighthouse command keeps three mobile runs and explicit optimistic aggregation, with a strict report gate rejecting LCP equality at 2,500ms. Stack/dependency pins and the health contract remain unchanged. The test Worker does not select production intake hosting. See [MR-01 evidence](mr-01-verification.md) for local results and outstanding remote proof; this dated update does not mark WS-0 complete.
