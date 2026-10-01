---
type: adr
status: accepted
created: 2026-10-01
updated: 2026-10-01
tags:
  - architecture
  - adr
  - miller-remodeling
related: [["PRD - 2026-10-01", "10-Projects/Active/Miller Remodeling/PRD - 2026-10-01.md"]]
agents:
  - technical-architect
---

# ADR-2026-10-01: Miller Remodeling frontend stack — Astro 7 + React islands

## Context

The Miller Remodeling rebuild (pro bono, testimonial exchange) needs a frontend stack for a fast content site — home, service/city pages, portfolio, testimonials — plus one rich interactive surface: the lead-qualification wizard. Build is executed by Codex with Matt reviewing; Matt has not used Astro before, prefers Angular, accepts React. BIS positioning constraint (2026-10-01): no WordPress, no theme-and-plugin stack — we are not a bargain plugin shop. Performance targets: Lighthouse ≥ 90, LCP < 2.5s.

## Decision

**Astro 7.x (pinned minor) + React for interactive islands, TypeScript throughout, static build output deployed on BIS-managed infrastructure.**

- Content (pages, portfolio, testimonials) via Astro's Content Layer API with Zod-validated schemas.
- Interactivity (qualification wizard, now; cost explorers / quizzes later) as React islands with explicit `client:` hydration directives. React nowhere else.
- `astro check` (type checking) + Lighthouse CI run on every PR — mechanical guardrails for AI-generated code.
- Intake API stays a separate BIS-owned backend (per PRD WS-2); Astro never serves as the app server.
- **Hosting (locked 2026-10-01, Matt): Cloudflare Pages** on a BIS-owned Cloudflare account. Static build output deployed via CI; preview deploys per PR. DNS stays at Porkbun (records pointed at Pages) unless Matt later moves nameservers. Rationale: free tier covers the workload, global CDN, first-party Astro adapter support, zero server management. Portable — static files can move to any host. Intake API hosting (leading candidate: Cloudflare Worker in the same account) is decided in the WS-2 spec.

## Alternatives

- **Next.js (static export):** Matt's most familiar React option. Rejected as the default because it ships a heavier JS runtime for a site that is 95% static content; Astro's zero-JS-by-default hits the performance targets with less effort. Remains the fallback if Astro proves problematic.
- **Angular:** Matt's preferred framework, but the wrong shape for this project — an app framework with heavier ceremony and runtime for a content site. Rejected.
- **Stay on WordPress:** rejected on positioning grounds (Matt, 2026-10-01) and technical grounds (plugin attack surface, maintenance burden on a non-technical owner).

## Architectural Principles

- Zero JavaScript by default; interactivity is opt-in per island.
- Content as typed data (collections), not as templates with queries.
- AI-generated code is held to human standard: pinned versions, type checking, CI gates.
- Static output = portable: no framework lock-in on hosting (Cloudflare's 2026 acquisition of Astro noted; MIT license retained, static build is host-agnostic).

## Benefits

- Performance targets achievable by construction, not by tuning.
- React reused exactly where Matt is comfortable (wizard); no new-framework learning curve on the critical path.
- Content model (portfolio, testimonials, reviews) maps cleanly onto collections — Erik's per-job publishing flow stays simple.
- Islands scale: future interactive tools are additional islands, no re-architecture.

## Tradeoffs

- Matt learns Astro's routing/content conventions (small surface; React knowledge transfers).
- Two-component mental model (Astro shell + React islands) vs. one-framework uniformity.
- Smaller hiring/community pool than Next.js if BIS ever staffs this out (mitigated: static output is portable).

## Risks

- **Version drift in AI-generated code:** Codex's training data spans Astro 4–7; v4/v5-era patterns (old content-config paths, `Astro.glob()`) may surface. Mitigated by pinned version + `astro check` in CI + this ADR as the source of truth.
- **Hydration directive misuse** (`client:load` vs `client:visible`): caught in code review; default to `client:visible` for below-fold islands (convention recorded in WS-0 spec).
- **Ecosystem churn:** Astro 7 is current as of 2026-10-01; revisit if a major version changes the content APIs again.

## Revisit When

- The site needs real app behavior (auth, dashboards, heavy client state) — reassess Next.js or equivalent.
- Astro 8+ introduces breaking changes to the Content Layer API.
- Build/agent experience shows Codex consistently fighting the framework despite guardrails.
