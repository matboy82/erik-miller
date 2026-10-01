# Bootstrap foundation

**Status**: Accepted
**Approval recorded**: Matt, 2026-10-01 — “Approved”; includes the dated MR-01 reconciliation below.
**Date**: 2026-10-01.

The local scaffold follows the PRD's reported stack choice: Astro 7 + React integration + TypeScript, static Cloudflare Pages, separate Worker. Its externally referenced accepted ADR was not attached. This record neither replaces it nor claims its approval.

Local executable defaults: npm workspaces/lockfile, Astro 7.3.5, TypeScript 6.0.3 compatible with lint tools, Node 24+, Worker dry-run. Shared packages remain empty; A is a review starting point, not final brand selection. These choices support the directly authorized local bootstrap.

Formal WS-0 planning must reconcile this record with the source ADR and confirm defaults. No production persistence, JobTread contract, scheduler, notification provider, or analytics behavior is approved here.

## Accepted reconciliation — 2026-10-01

The [accepted source frontend ADR](ADR-2026-10-01-Miller-Remodeling-Frontend-Stack.md) is now supplied locally. It governs Astro 7, React islands, TypeScript, static Pages hosting, and separate backend ownership. The preceding text records the original bootstrap context and is preserved.

For [MR-01](../../product/stories/website-lead-qualification/mr-01.md) and its [developer spec](../../specs/website-lead-qualification/mr-01.spec.md), confirm the existing exact package pins and lockfile, Node 24+ npm workspaces, and current health-only test Worker. The Worker is infrastructure proof; production intake hosting remains a WS-2 decision under the source ADR. Future content collections use Content Layer/Zod and below-fold React islands default to `client:visible`; MR-01 adds neither surface.

Matt accepted this record and reconciliation on 2026-10-01 with the MR-01 spec, manifest, and [0002 test deployment decision](0002-test-deployment-isolation.md). It accepts no final brand, production launch, or unrelated integration design. Historical bootstrap text above is superseded by this dated reconciliation where it describes the source ADR as missing or reconciliation as pending.
