# MR-02 implementation evidence

**Verdict**: NOT READY - evidence incomplete.
**Work item**: MR-02
**Scope**: MR-02-P1 through MR-02-P3, complete approved manifest.
**Date**: 2026-10-01 (America/Denver)
**Candidate**: HEAD `37f7bd990663fa5b0fd641f3fcef101dc543bb89` plus the uncommitted MR-02 changes.
**Contract**: Approved [spec](../specs/website-lead-qualification/mr-02.spec.md), [manifest](../specs/website-lead-qualification/mr-02.work-packages.md), [story](../product/stories/website-lead-qualification/mr-02.md), and [QA plan](../qa/test-plans/website-lead-qualification.testplan.md).

Local implementation provides independent theme/copy/tagline controls, safe preference restoration, a versioned approval gate, selected production assets, and disposable all-direction verification. Manual browser and remote evidence, code-review, and fresh-session adversarial review remain incomplete. This is a same-session implementation evaluation, not independent review or story acceptance.

## Working scope and impact

P1 changes the existing review component/script, typed catalog, page, and direction styles. P2 changes build entry/validation and output inspection through the existing `verifyProduction(directory, direction)` seam. P3 adds a local measurement command and retains evidence. Blast radius is Medium because these changes govern production build approval and shared output. There is no backend/API, database, CRM, dependency upgrade, deployment, or DNS change.

ADR 0003 is Accepted under Matt's recorded approval. Accepted 0001, 0002, and the source frontend ADR remain governing. No new brand-choice ADR or real lock exists. BRAND-01 and all other placeholders remain Open. The brand-review runbook, README, and dated bootstrap note describe current behavior.

The pre-existing diffs in `.github/workflows/ci.yml`, `.node-version`, `docs/operations/cloudflare-test.md`, `package-lock.json`, and `package.json` were captured before implementation and compared afterward. They are unchanged and are not MR-02 work. Source documents and existing ADR history are preserved. No commit or push occurred.

## Outcome traceability

| Acceptance / QA | Status | Implementation and actual evidence |
|---|---|---|
| AC1 / B1 | Partial | Full palettes/type pairings and all four copy fields match pinned kit sections 5/10/12. Built review fixtures contain all choices. Node script-boundary tests exercise all nine theme/copy combinations and all six tagline candidates. Computed-style comparison in an interactive browser is not run. |
| AC2 / B1 | Partial | Script-boundary tests prove resets, saved IDs, legacy migration, invalid themes/copy/taglines, malformed/primitive storage, and blocked storage. The DOM-readiness regression is covered. Actual browser reload/storage interaction is not run. |
| AC3 / B2 | Partial | Native labels/status, visible focus, 44px controls, responsive wrapping, and in-flow toolbar are implemented. Automated mobile accessibility evidence and retained screenshots support the rendered default states. Keyboard/touch, 320px/390px, 200% zoom, contrast measurements, and full applicable WCAG 2.1 AA checklist are not run. |
| AC4 / B1 | Partial | Toolbar and adjacent copy identify Draft status, pending Erik choice, and unverified claims. Real approval and final logo remain absent. Screenshots confirm Draft notices; complete interactive walkthrough remains unverified. |
| AC5 / B3 | Proven locally | Canonical lock schema, exact choice/ADR/evidence agreement, path containment, synthetic-record rejection, and mode/env guards are tested. Root production and web-workspace production commands reject the absent lock with exit 1 and remove stale output. Built production fixtures pass full tree/token/copy/font inspection. |
| AC6 / B3 | Proven locally | A/B/C defaults and B visuals/C copy/paper-first tagline build in disposable fixtures. Complete inventories and hashes are retained. Fixtures clean up without creating a real lock or changing root choice records. |

P1's implementation is present, but its B1/B2 manual evidence is incomplete. P2's local guard/isolation evidence is complete. P3's measurements are complete; manual/remote evidence and required review remain incomplete. Persistent review of the current candidate requires separately authorized publication through MR-01's established resource; local code has not been published.

## Verification commands and sensitivity

Command logs are retained under `.tmp/mr-02/` and browser reports under `.lighthouseci/brand/`. They are local, ignored artifacts; no raw credentials or lead PII are retained.

- `node --test scripts/test/design-review.test.mjs scripts/test/brand-build.test.mjs scripts/test/production-isolation.test.mjs`: targeted control/schema/path/leak cases pass. New behavior had failing tests before implementation. The DOM-readiness test reproduced the real startup error before its fix.
- `npm run check`: exit 0, 29 skills validated, lint/typecheck passed, 19 tests passed, web build and Worker dry-run passed, and four production-isolation builds passed. Raw output in `.tmp/mr-02/check-final.log` includes `tests 19`, `pass 19`, `fail 0`, and `--dry-run: exiting now.` Initial restricted execution failed in the unchanged Worker bundler; the successful run used required local filesystem access.
- `npm test`, `npm run lint`, and `npm run check:production`: exit 0 after the last approval-status guard refinement. The current ADR status, rather than a historical Accepted line under a Proposed record, controls acceptance. Logs are `.tmp/mr-02/tests-final.log` and `.tmp/mr-02/isolation-final.log`; the full Node suite still has 19 passing tests and no skipped cases.
- `npm run build:production`: expected exit 1, `Production requires a valid canonical brand lock.` The canonical lock is absent and stale web output is removed.
- Web-workspace `node ../../scripts/astro.mjs build` with `SITE_BUILD=production`, `SITE_BUILD=production-check`, or `SITE_BUILD=production` plus `BRAND_DIRECTION=A`: each exits 1 and retains no stale output.
- `node scripts/check-brand-lighthouse.mjs`: exit 0 for the final A/B/C run; nine reports meet the strict mobile gate and all nine console-error audits pass. Log: `.tmp/mr-02/brand-lighthouse-ready.log`. The restricted attempt could not connect to Chrome; those failed attempts are separate from the final reports.
- `git diff --check`: exits 0. Git emits existing CRLF-to-LF notices; npm emits host configuration warnings for `msvs_version` and `python`. No coverage threshold is configured.

Sensitivity: temporarily using the theme's copy instead of the selected copy made its owning test fail (exit 1); weakening the approver check also failed (exit 1). Exact original bytes were restored and tests returned exit 0. Immediate initialization before the content DOM exists failed the readiness test; restored readiness handling returned exit 0. Logs are `design-review-sensitivity.log`, `brand-build-sensitivity.log`, and `dom-ready-sensitivity.log` under `.tmp/mr-02/`.

Equivalent negative controls inject leaked controls, alternate/minified tokens, plain/Unicode-escaped alternative copy in unused JSON, wrong rendered text, incorrect embedded font bytes, and an unused font file. The owning output test rejects each. A directory-junction escape also rejects. No temporary source mutation remains.

## Required quality bars

Pin: branding kit 2026-10-01, candidate above, unchanged dependency lockfile, and unchanged `lighthouserc.cjs`. Node v26.9.0, npm 12.1.0, Chrome 154.0.8037.58, Lighthouse 12.6.1 on Windows. Three same-page mobile reports per direction use 412x823 screen emulation, DPR 1.75, simulated throttling, RTT 150ms, throughput 1638.4Kbps, and CPU slowdown 4. Individual report settings include Lighthouse's derived request latency/upload/download values.

## Remediation status — 2026-10-02

Implementation remains present. Required current-candidate browser comparison, storage/transition branches, keyboard/touch/contrast/focus and responsive/zoom evidence remain incomplete. The code-review verdict remains Block; retained measurements and the local aggregate check do not satisfy B1/B2 manual evidence.

Aggregation remains optimistic: best score per required category and lowest LCP across three valid runs. Required thresholds are >=90 for performance/accessibility/best practices and LCP strictly <2500ms. SEO stays warning-only for the deliberately noindex preview. Browser reports retain every individual value, effective settings, source/file/config/lockfile hashes, assertion results, and page screenshots.

**Mobile performance bar: Bar met.** Final reports and source/config snapshots are under `.lighthouseci/brand/1790916544331/{A,B,C}/`; each contains three reports, assertions, fixture metadata, and an extracted screenshot. Scores below are the approved optimistic aggregates, not claims that every individual score equals the best result.

| Review direction | Performance | Automated accessibility | Best practices | Optimistic LCP |
|---|---|---|---|---|
| A | 100 | 100 | 100 | 1269.32ms |
| B | 100 | 100 | 100 | 1290.47ms |
| C | 100 | 100 | 100 | 1342.11ms |

**Accessibility and interactive brand-comparison bars: Unverifiable in full.** Default-state screenshots show the selected directions and initialized status; source values match the kit. Manual computed-style, interaction, and applicable WCAG evidence remains missing. The 412px Lighthouse viewport does not establish the required 320px/390px/200% zoom branches.

After the final approval-header guard refinement, fresh review builds for all three directions emitted HTML byte-identical to their measured artifacts. `.tmp/mr-02/artifact-equivalence.json` records the matching hashes and final measurement run. The refinement affects production approval validation, not browser output.

Earlier qualifying scores were insufficient evidence for working controls: screenshot inspection exposed initialization before the content DOM. The fix has a failing-before/passing-after readiness test and is confirmed by the final initialized status and error-free reports. A missing-favicon 404 was corrected with an empty draft favicon declaration, without creating a final logo. Older report directories remain historical attempts and must not be mixed into the final result.

## Remaining evidence and handoff

- **Unverified**: full B1 interactive selection/reload/storage and computed-style comparison; B2 keyboard/touch/contrast/320px/390px/200% zoom and applicable AA checklist. Browser-control inventory was empty and the in-app browser provider was unavailable. Lighthouse screenshots do not replace these checks.
- **Not run**: current-candidate persistent test URL walkthrough; no publication was authorized or performed.
- **Not run**: code-review and required fresh-session adversarial review. Their verdicts belong together in `mr-02.review.md`; no same-session checking is independent.

Next action: complete the runbook's manual browser evidence, then use `$sdd-review` in a fresh session with approved artifacts, repository instructions, raw diff, changed files, and verification output. A local packet under `.tmp/mr-02/review/` supplies `inputs.json`, `raw-diff.patch`, and `changed-files.txt`; it excludes implementation conversation/reasoning and this same-session evaluation. Missing remote evidence and other production placeholders remain explicit gates; no release readiness is claimed.
