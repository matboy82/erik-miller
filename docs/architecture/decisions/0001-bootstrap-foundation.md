# Bootstrap foundation

**Status**: Proposed for the formal WS-0 technical gate.
**Date**: 2026-10-01.

The local scaffold follows the PRD's reported stack choice: Astro 7 + React integration + TypeScript, static Cloudflare Pages, separate Worker. Its externally referenced accepted ADR was not attached. This record neither replaces it nor claims its approval.

Local executable defaults: npm workspaces/lockfile, Astro 7.3.5, TypeScript 6.0.3 compatible with lint tools, Node 24+, Worker dry-run. Shared packages remain empty; A is a review starting point, not final brand selection. These choices support the directly authorized local bootstrap.

Formal WS-0 planning must reconcile this record with the source ADR and confirm defaults. No production persistence, JobTread contract, scheduler, notification provider, or analytics behavior is approved here.
