# MR-05-P1/P2 implementation evidence

**Evaluated**: 2026-10-02  
**Scope**: Approved MR-05-P1 and P2, local implementation only  
**Result**: NOT READY - P1/P2 source implementation is complete, but the P2 manual browser check was unavailable. The demo UI intentionally does not submit to the Worker, and live JobTread/Cloudflare behavior remains Unverified; this is not full-story acceptance or release readiness.

## Acceptance-criterion status

| AC | Status | Evidence and limit |
|---|---|---|
| 1. Contact experience and receipt | Partial | Test-copy preview shows fields and simulated confirmation. It does not send a request or prove actual receipt. |
| 2. JobTread customer/inquiry | Partial | Mapping and readback logic implemented; live fields, permissions, and retrieved records Unverified. |
| 3. Validation | Proven locally | Worker tests cover rejected inputs; preview shows validation guidance. |
| 4. Duplicate submission | Partial | Worker idempotency tests pass; browser preview is not connected to the API. |
| 5. Delay, recovery, reconciliation | Partial | Worker control paths pass local-double tests; Cloudflare/JobTread behavior Unverified. |
| 6. Privacy and approved boundaries | Partial | Local privacy tests and no-network synthetic preview pass; live storage/deletion behavior Unverified. |

## Outcome and evidence

| Requirement | Local evidence | Status |
|---|---|---|
| Bounded contact contract and safe validation | `POST /intake/contact`, UUID idempotency key, field/body limits, normalization, and field-safe errors exercised through Worker `fetch(Request)` | Proven locally |
| Durable receipt and duplicate handling | D1 insert/read plus Queue enqueue; same-key retry returns the same receipt, changed payload returns conflict, and failed acceptance does not claim receipt | Proven with local doubles; D1 account behavior Unverified |
| Delayed delivery and recovery | Queue retry/DLQ paths, durable write checkpoints, operator status/retry/reconciliation, and ambiguous-write stop covered with local doubles | Proven as Worker control behavior; Cloudflare queue and JobTread behavior Unverified |
| JobTread general inquiry mapping | Worker implements customer → location → contact custom field → job and independent readback checks | Implemented; live field IDs, permissions, mapping, partial success, and readback Unverified |
| Privacy and data lifecycle | Payloads expire after seven days when delivered or 30 days otherwise; payload-free metadata is retained 90 days. Scheduled cleanup test confirms payload removal while keeping safe status. Responses/log sentinels exclude lead payload | Proven locally; D1 backup/deletion behavior Unverified |
| Operator boundary | Cloudflare Access RS256 JWT validation, issuer/audience/signature checks, and fail-closed email allowlist; signed-token and no-payload response test | Proven with a local JWKS double; live Access policy and identities Unverified |
| Review-site contact experience | Fixed synthetic read-only values; local success and validation examples with live-region announcements; no network or storage; component omitted from production builds | Proven by UI controller tests, review build, production-isolation suite; manual keyboard/browser check Unverified because no browser UI surface was available |

## Verification run

- `node --test apps/worker/test/intake.test.ts` - 14 passed, including the default-off intake guard.
- `node --test scripts/test/contact-preview.test.mjs` - 2 passed for local success/validation announcements and inert behavior when review controls are absent.
- `npm run typecheck --workspace @miller/worker` and `npm run typecheck --workspace @miller/web` - passed.
- `npm run lint` - passed.
- Migration executed successfully against disposable in-memory SQLite; this is syntax/shape evidence, not Cloudflare D1 evidence.
- `npm run check` - passed after both packages and UI tests: 29 skills validated, lint/typecheck passed, 61 repository tests passed, review build and Worker dry-run passed, and production isolation passed for A/B/C and mixed-choice fixtures.
- `npm run lighthouse` - three mobile runs passed performance, accessibility, best-practices and strict LCP checks; optimistic LCP 1,168.6 ms. SEO 0.66 is warning-only for the noindex review build.
- `node scripts/check-brand-lighthouse.mjs --project-content` - six three-run mobile variants passed (A/B/C with normal and replacement content); optimistic LCPs 1,227.8 / 1,265.9 / 1,150.2 / 1,249.9 / 1,240.4 / 1,245.7 ms. SEO 0.66 was warning-only in each noindex preview.
- Manual browser/keyboard review was not run because this session had no available browser UI surface. UI controller tests passed; Lighthouse confirmed rendered-page accessibility scores and no console errors.
- `git diff --check` - passed.
- Sensitivity check: temporarily removed reuse of the existing receipt ID. `retry with the same idempotency key` failed on receipt mismatch as expected; the exact line was restored and the test passed again.

## Changed MR-05 package files

- `apps/worker/src/index.ts`
- `apps/web/src/components/ContactPreview.astro`
- `apps/web/src/scripts/contact-preview.js`
- `apps/web/src/pages/index.astro`
- `apps/web/src/styles/global.css`
- `scripts/test/contact-preview.test.mjs`
- `apps/worker/test/intake.test.ts`
- `apps/worker/wrangler.jsonc`
- `apps/worker/migrations/0001_intake.sql`
- `apps/worker/openapi.yaml`
- `docs/operations/intake.md`
- `docs/product/stories/website-lead-qualification/mr-05.md`
- `docs/specs/website-lead-qualification/mr-05.spec.md`
- `docs/specs/website-lead-qualification/mr-05.work-packages.md`

## Live prerequisites and gates

- Configure the real D1 database and queues; apply the migration; verify backup behavior and deletion retention.
- Configure the individual Erik/Matt Cloudflare Access identities, allowlist, observability alerts, and notification delivery.
- Populate the JobTread organization ID and existing contact email/phone field IDs; verify permissions and workflow side effects.
- Obtain Erik's approval of final public fields and copy. Matt's separately approved synthetic JobTread operation plan is required before any external write.
- Run approved synthetic J1/J2 operations, independently retrieve values/links, and reconcile cleanup. Local doubles are Simulation evidence only.
- Independent code and adversarial reviews remain required before release readiness under the repository review gate. No deployment, account changes, or DNS actions were performed.
