# MR-03 implementation evidence — 2026-10-02

**Verdict**: NOT READY — evidence incomplete.
**Evaluated scope**: Complete MR-03 manifest, P1–P3, selected by Matt (“all”) on 2026-10-02.
**Contract**: Approved [story](../product/stories/website-lead-qualification/mr-03.md), [QA plan](../qa/test-plans/website-lead-qualification.testplan.md), [spec](../specs/website-lead-qualification/mr-03.spec.md), [packages](../specs/website-lead-qualification/mr-03.work-packages.md), and Accepted [0004](../architecture/decisions/0004-project-content-eligibility.md).
**Baseline**: HEAD `cf12fb7`; only the three MR-03 planning artifacts were untracked at implementation entry. No pre-existing product diff was changed or claimed.
**Evaluation**: Same-session implementation checks, not independent review.

## Delivered outcome and boundaries

The review home page reads a Zod-validated Content Layer project record and renders a local responsive image, meaningful alt text, visible stock/Draft notices, credit and illustrative prose. Two differently proportioned licensed substitutes have source, permission, owner, identity and unblock records linked from `PLACEHOLDERS.md`. The record-only rehearsal uses the portrait image and longer prose; layout/component code is unchanged between those fixture states.

Production preflight rejects unresolved project content and any Open root entry, checks exact image/title/alt/prose approval, and clears stale output on failure. Whole-output inspection preserves brand/font checks and verifies source-derived image derivatives, selected content, and exclusion of unused media, archived Draft prose and embedded payloads. Synthetic fixtures use geometric media and local synthetic evidence; they cannot approve canonical production.

Blast radius is Medium: content/build configuration and existing production verification callers change. `buildWeb` is now awaited by both of its callers. Static production has no React islands, so its React integration/client artifact is omitted; review retains the existing integration. No dependency or lockfile change, backend/API, database, CRM, CMS, account change, commit, push, deployment or DNS action is performed. Secrets and lead PII were not used.

Accepted source/frontend ADRs 0001–0003 remain governing; 0004 records the approved content policy. README, dated bootstrap notes and the [content runbook](../operations/project-content.md) describe current behavior. All real root entries remain Open; CONTENT-SUB-01 and CONTENT-SUB-02 are newly registered Open entries. No real brand lock, Erik content approval, or Miller photograph was created.

## Acceptance and package evidence

| AC / QA | Status | Evidence and limit |
|---|---|---|
| AC1 / C1 | Proven locally | Review build renders the photo, readable illustrative prose, two derived notices and credit. Downloaded photos were visually inspected and re-encoded without EXIF/IPTC/XMP. Content tests enforce stock/Draft state and reject relabeling known stock as Miller. No factual customer/result claim was added. |
| AC2 / C1 | Proven locally | Two root-linked substitute records inventory photo and prose separately within each record, with original source/license, creator, retrieval date, hashes, owner and unblock condition. Existing root statuses/history remain unchanged. |
| AC3 / C2 | Proven locally | A fresh final-source rehearsal changed only the content JSON, with source/config/script/register hashes captured before and after. The photo changed from 1600×1068 to 960×1280 and the prose from 455 to 1,125 characters. The static component, page and styles were unchanged; `rehearsal.json` retains the evidence. |
| AC4 / C2, B2 | Partial | Portrait/long-copy builds preserve explicit intrinsic dimensions, responsive WebP variants, lazy loading, decoding and alt text. Mobile measurements are recorded below. Browser control is unavailable; 320px/390px, 200% zoom, keyboard/touch, focus, contrast and full applicable AA checks remain Unverified. |
| AC5 / C2 | Partial | Exact-content approval schema/evidence, stale title/alt/prose rejection and derived label removal are exercised by synthetic fixtures. Real approved Miller material is absent; actual replacement, Erik sign-off and matching-entry closure remain Unverified. |
| AC6 / C3 | Proven locally | Production command failures for Open roots and stock clear output; canonical synthetic approval/mode/path overrides fail. Complete built-artifact tests reject hidden Draft prose, embedded imagery, unused stock, unknown files and changed media. A/B/C and mixed brand fixtures retain complete inventories without changing real approval. |

P1 implementation and its local record/build evidence are present. P2 local readiness/isolation behavior is implemented and tested. P3 rehearsal and measurement tooling are present; manual, real-content, remote and independent-review branches prevent full-story completion. Synthetic success is not production readiness.

## Commands and sensitivity

Raw command logs are retained locally under `.tmp/mr-03-evidence/`; browser reports remain under `.lighthouseci/project/`. These are ignored local evidence, not remote CI results.

- `node --test scripts/test/project-content.test.mjs`: six focused scenario groups cover C1–C3. Red logs demonstrate absent implementation, hidden Draft leakage, stock-origin relabeling, valid HTML-escaped copy rejection, and indented Open-row bypass before their fixes. Each has passing follow-up evidence.
- Critical negative controls modify only disposable output/register/records: hidden Draft copy, embedded images, unused stock, changed derivative bytes, stale approval and Open/invalid statuses must fail. Original fixture bytes/records are restored; successful verification follows restoration; safe cleanup removes the fixture. No canonical approval is modified.
- `npm run check`: final-source exit 0; 29 skills validated, lint/typecheck passed, 25 tests passed with zero failures, review build and Worker dry-run passed, and four complete production-isolation fixtures passed. `check-final-source.log` retains actual output including `tests 25`, `pass 25`, `fail 0` and `--dry-run: exiting now.` Earlier restricted execution failed in the unchanged Worker bundler on parent-directory access denial; successful verification used required local filesystem access.
- `npm run build:production` and web workspace `SITE_BUILD=production`: both exit 1 for the absent real brand lock and remove canonical `apps/web/dist`. Direct canonical content validation independently rejects the stock/Draft representative record. Fixture command tests establish the content/Open-root branches behind a valid synthetic brand lock. Logs: `canonical-production.log` and `workspace-production.log`.
- `git diff --check` and relative-link inspection passed. npm emitted existing global `python`/`msvs_version` configuration warnings and Git emitted CRLF normalization warnings; these are retained without changing user configuration.

## Required quality protocols

Reference inputs are the branding-kit edition 2026-10-01, WCAG 2.1 AA, Node v26.9.0, npm 12.1.0, tested revision/dirty diff, pinned lockfile and `lighthouserc.cjs`. `node scripts/check-brand-lighthouse.mjs --project-content` uses installed Chrome with three mobile runs for each of six states. Report settings, source/image/config/lockfile hashes, console results and individual reports are retained per state.

Aggregation remains optimistic: maximum score per required category and minimum LCP across three valid runs. Required performance/accessibility/best-practices scores are ≥90 and LCP strictly <2500ms through the existing strict checker. SEO stays warning-only because review is noindex.

**Mobile performance bar: Bar met.** The command exited 0. All 18 reports, assertions, state/source snapshots and extracted viewport screenshots are under `.lighthouseci/project/1790945835920/{normal,replacement}/{A,B,C}/`. `mobile-summary.json` retains every individual result and effective settings. Lighthouse 12.6.1 used HeadlessChrome 154.0.0.0 on Windows 10.0.19045 x64, 412×823 mobile emulation at DPR 1.75, simulated throttling with RTT 150ms, throughput 1638.4Kbps and CPU slowdown 4.

| Content / direction | Performance | Automated accessibility | Best practices | Optimistic LCP |
|---|---|---|---|---|
| Normal A | 100 | 100 | 100 | 1182.95ms |
| Normal B | 100 | 100 | 100 | 1222.55ms |
| Normal C | 100 | 100 | 100 | 1217.96ms |
| Replacement A | 100 | 100 | 100 | 1220.91ms |
| Replacement B | 100 | 100 | 100 | 1270.05ms |
| Replacement C | 100 | 100 | 100 | 1214.61ms |

These are approved optimistic aggregates, not claims that each individual report equals the best result. Production-guard corrections occurred during measurement; final-source review builds for all six states emitted byte-identical HTML to the measured artifacts. `artifact-equivalence.json` records every pair of matching hashes. A separate same-source rehearsal confirms that the content swap itself changes only the JSON record. Ordinary review A output was restored, canonical records/register were preserved, and no disposable brand-fixture directories remain.

**Full accessibility bar: Unverifiable.** Automated scores and viewport screenshots cannot replace the required manual protocol.

## Remaining evidence and handoff

- **Unverified**: manual keyboard/touch, 320px/390px, 200% zoom, contrast, focus and applicable WCAG 2.1 AA checklist. Computer/browser inventory returned no surfaces and the in-app browser returned “Browser is not available: iab”. No alternative UI automation was used.
- **Unverified**: real Miller photo/writeup provenance, actual Erik sign-off, label removal and matching-entry closure. Keep both substitutes and CONTENT-01 Open until those conditions are verified.
- **Not run**: current-candidate persistent/preview URL review; publication was not authorized.
- **Not run**: code-review and required fresh-session adversarial review. Both verdicts belong in `mr-03.review.md` before release planning. This report is not either verdict.

Complete manual and real-content evidence where prerequisites permit, then use `$sdd-review` with approved artifacts, repository instructions, raw diff, changed-file list and actual command output. The local packet at `.tmp/mr-03-evidence/review/` contains `inputs.json`, `raw-diff.patch`, `changed-files.txt` and candidate file hashes. It excludes implementation conversation/reasoning and this same-session evaluation. No release readiness is claimed.
