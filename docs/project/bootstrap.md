# Local bootstrap - 2026-10-01

The user's request authorizes local project initialization and Claude-to-Codex skill conversion. This is not a completed WS-0 milestone or approval of later workstreams.

## Sources and scope

Exact byte copies of both supplied documents are under `docs/product/briefs` and `docs/brand`. Draft status/open decisions are unchanged. Embedded account/deploy instructions are reference material, not independent authorization. The separately referenced locked stack ADR was not attached; retrieve it before formal technical planning/production readiness.

Delivered locally: npm monorepo; Astro 7.3.5 static review page + React integration; TypeScript 6.0.3 supported by lint tooling; Node 24+; self-hosted fonts; A/B/C draft theme/copy toolbar; health Worker; CI and opt-in test deployment configuration; placeholder register and runbooks; 29 native Codex skills, shared contracts, and explicit rule references. Original Claude sources are preserved.

## Remaining milestone evidence

WS-0 still needs formal approved planning and external proof: remote CI, persistent test URL, live Worker, PR previews, secret-store verification, reviewed cutover runbook. No later intake/wizard/scheduler/CRM/CMS scope is implemented.

See `docs/project/bootstrap-verification.md` for actual check results. Local checks do not replace independent review, Erik's design approval, or release authorization.
