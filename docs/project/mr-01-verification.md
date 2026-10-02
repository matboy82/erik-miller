# MR-01 implementation evidence

**Work item**: MR-01
**Date**: 2026-10-01
**Scope**: Complete approved [manifest](../specs/website-lead-qualification/mr-01.work-packages.md), sequential P1–P3
**Result**: NOT READY — evidence incomplete. P1 and P2 local implementation/verification are complete; P3 remote execution is blocked.

## Deployment flag removal ? 2026-10-01

Matt explicitly requested removal of the deploy flag. The local workflow and deployment planner now require successful verification and an eligible event, without `ENABLE_TEST_DEPLOYS`. The story, spec, QA matrix, setup guide, and dated amendment to accepted ADR 0002 reflect that instruction. Earlier flag-related observations and setup advice below are historical and superseded by this amendment. No commit, push, settings change, or deployment was performed for this change.

The updated focused suite first failed in the expected two places: the planner rejected a passing main event without the flag, and the workflow still referenced the flag. After removal, `node --test scripts/test/test-deployment.test.mjs` reported 8 tests, 8 pass, 0 fail. Failed verification, fork isolation, stale-main, noindex, credential isolation, and live-response guards remain covered locally. This does not establish remote publication.

`npm run check` initially stopped at the Worker dry run because the sandbox denied parent-directory access. The authorized retry outside the sandbox exited 0: 29 skills validated, lint and type checks passed, 15 tests passed with 0 failures, the review site built, the Worker dry run succeeded, and production isolation passed for A, B, and C. `git diff --check` passed. No new browser Lighthouse measurement or remote publication was run for this flag removal.

## Contract and baseline

The stakeholder outcome is a verified persistent noindex review site, distinct same-repository PR previews, and a healthy test Worker. The [approved spec](../specs/website-lead-qualification/mr-01.spec.md), approved story/QA plan, and accepted source/0001/0002 ADRs govern this work. No production, DNS, intake, JobTread, brand, dependency, or content-model change is included.

Baseline HEAD: `6cc594ff30557b67a0f96de0016ad63e8efbc085`. Pre-existing changes: 0001, MR-01 story, shared QA plan; untracked 0002, source frontend ADR, and technical artifacts under `docs/specs/`. Those planning/source documents are preserved and are not implementation output. No commits, pushes, remote configuration, or deployments have been performed.

Impact: Medium, because CI credentials and shared hosting are affected. Interfaces remain the existing npm commands, workflow event/job boundary, published HTTP responses, and Worker fetch contract. Focused script modules keep guard and response handling together; no new package, datastore, or browser framework is introduced. Independent review has not occurred.

## Verification ledger

Initial environment: Windows, Node `v26.9.0`, npm `12.1.0`. Node satisfies the repository's 24+ requirement; CI remains pinned to Node 24. Full effective Lighthouse settings and browser version are read from the retained reports.

The isolated checkout at `.tmp/mr01-fresh-20261001` was cloned locally from baseline HEAD and overlaid with the current nonignored source files, including uncommitted changes. It began without dependencies or generated artifacts. This proves the recorded source snapshot, not an uncommitted change magically present in baseline HEAD or a future remote revision. The original checkout was not reset or committed. Logs, tracked patch, and tested source SHA-256 manifest are retained under `.tmp/mr01-evidence/`; these ignored local artifacts are not remote CI records.

| Check | Actual result |
|---|---|
| `node --test scripts/test/lighthouse.test.mjs`, before implementation | Exit 1: the missing strict command caused the expected new-behavior failures. |
| Same command after implementation | Exit 0, 3 tests passed. |
| `npm run check`, sandboxed initial attempt | Exit 1 at Worker dry-run: Windows parent-directory read denied. Skills/lint/typecheck and 7 tests completed before that restriction. |
| `npm run check`, elevated local retry after P1 | Exit 0: 29 skills, lint/typecheck, 7 tests, static build, Worker dry-run and A/B/C isolation passed. |
| `npm run lighthouse`, sandboxed initial attempt | Exit 1: Chrome localhost debugging connection failed. No quality pass inferred. |
| `npm run lighthouse`, elevated local retry after P1 | Exit 0: three runs on review `/`; strict optimistic LCP 1059.2695ms. SEO 0.63 is the deliberate noindex warning. Reports under `.lighthouseci/`. |
| `node --test scripts/test/test-deployment.test.mjs`, before implementation | Exit 1: deployment guard module absent. |
| Same command after implementation | Exit 0, 7 tests passed after correcting the synthetic robots-response header to match the HTTP contract. |
| `npm run lint`, after P2 code | Exit 0. |
| `node --test scripts/test/test-deployment.test.mjs`, final command coverage | Exit 0, 8 tests passed, including disabled CLI execution with no credential diagnostics. |
| `npm ci`, isolated checkout | Exit 0; installed 734 packages from the existing lockfile. Full output: `.tmp/mr01-evidence/npm-ci.log`. |
| `npm run check`, isolated checkout with harmless credential sentinels | Exit 0; 29 skills validated, lint/typecheck passed, 15 tests passed/0 failed, static review build and Worker dry-run completed, and A/B/C isolation passed. Full output: `.tmp/mr01-evidence/check.log`. |
| `npm run lighthouse`, isolated checkout | Exit 0; three mobile `/` runs and strict report gate passed. Full output: `.tmp/mr01-evidence/lighthouse.log`; reports under `.tmp/mr01-fresh-20261001/.lighthouseci/`. |
| `verifyReviewArtifact` on the actual isolated review build | Passed: HTML/robots/headers noindex intact; complete artifact tree excludes both harmless credential sentinels supplied during the build. |
| `git diff --quiet -- package-lock.json` | Exit 0: dependency lockfile unchanged. |
| Documentation local links and `git diff --check` | 19 local links checked, 0 broken; diff whitespace check passed. |

Install warnings: existing global npm `python`/`msvs_version` config, transitive deprecation messages, and npm's audit summary of 14 vulnerabilities (2 low, 1 moderate, 11 high). npm 12 blocked install scripts for esbuild/workerd under its allowScripts policy; the subsequent builds and checks still passed. No audit fixes, script-policy changes, or dependency upgrades were performed. The audit findings require separate dependency assessment before claiming security readiness; this implementation does not resolve them.

Required A-state mobile bar: **Bar met locally**. Windows NT `10.0.19045.0`, Lighthouse `12.6.1`, browser-reported HeadlessChrome `154.0.0.0`; simulated mobile viewport 412×823, device scale 1.75, RTT 150ms, throughput 1638.4Kbps, CPU slowdown 4. All effective settings are retained in each JSON report. Aggregation remains optimistic (best category score, minimum LCP), not a claim that every future run meets the bar.

| Isolated run | Performance | Accessibility | Best practices | LCP ms |
|---|---|---|---|---|
| 1 | 100 | 100 | 96 | 1060.2042 |
| 2 | 100 | 100 | 96 | 1066.1410 |
| 3 | 100 | 100 | 96 | 1058.2631 |

Strict aggregated LCP is 1058.2631ms, below 2500ms. SEO is 63 in all three runs and remains warning-only for intentional noindex. Pinned SHA-256 references: lockfile `3341F52F5B7D5EB8C23DB74990B894F22BBEA955A43269C030C96538B3390A04`; LHCI config `DB044F2356831740D9786728E8D6046A749AF182968192B0AF45E718CB89340A`; 2026-10-01 branding kit `D5E2A378A1FFCB19AA22BC22A975BA9AA579B3129A226418F60C6B17E39906CB`.

Sensitivity: temporary changes allowing LCP equality, fork publication, credential sentinel leakage, and missing HTML noindex each made the owning test fail with the expected assertion. Exact original bytes were restored in `finally`; owning tests then passed. Synthetic API/HTTP responses test true external boundaries and establish no live behavior. Existing health characterization tests remain unchanged because they already prove that local contract.

## Traceability and remaining proof

| Scope | State | Evidence / missing result |
|---|---|---|
| P1 / F1 / AC1 | Proven locally | Isolated clean install, aggregate check, strict three-run measurement, versions/settings, logs and source-snapshot hashes. A later remote revision still needs its own evidence. |
| P2 / F2 / AC2,4 | Partial | Local event/fork/stale-main restrictions and workflow secret-step checks pass. Actual publication and remote secret isolation remain unverified. |
| P2 / F3 / AC3,5 | Partial | Artifact noindex and synthetic live-response tests pass. Persistent/preview URLs and live Worker checks are not available. |
| P2 / F4 / AC6 | Partial | Sentinel leakage is detected; actual isolated output excludes build sentinels. Setup names match the workflow. Restricted remote configuration and full placeholder unblock evidence remain unverified. |
| P3 remote matrix and placeholder handoff | Blocked | Matt's confirmed remote boundary/configuration and explicit configuration/push/deploy/failing-check authorization are required. No secret values requested in chat. |

All INFRA and RELEASE placeholders stay Open. Real production/brand/content gates are untouched. Required A-state performance is measured locally; MR-02/B/C and MR-03 replacement-media scenarios remain outside this implementation scope and unverified here. Lighthouse does not establish WCAG conformance or remote quality.

P1's local DoD is proven by the strict command tests, restored equality sensitivity check, accepted source/0001/0002 conformance, README/bootstrap updates, and clean-install measurements. P2's local DoD is proven by the event/stale-main/response/artifact guards, restored fork/credential/noindex sensitivity checks, complete suite/static/build checks, workflow matrix inspection, and setup-guide updates. Their remote outcomes remain Partial in the table. Neither package selects production intake hosting or changes the Worker API.

Implementation changes are `.github/workflows/ci.yml`, root Lighthouse npm wiring/config, new `scripts/check-lighthouse.mjs` and `scripts/test-deployment.mjs` with their Node tests, README, the setup guide, bootstrap current-state note, and this evidence file. Pre-existing planning/source changes remain separate. The web page, Worker source/config, dependency versions/lockfile, and placeholder statuses were not changed. Source inspection found the web's existing build-mode/direction inputs and review preference storage; no new client credential or lead-data path was added. No temporary mutations, focused/skipped tests, or debug bypasses remain.

## Remote CI observation — 2026-10-01

Matt committed/pushed candidate `e1fa1a63af126567301d97cdae53348995334d69`. The GitHub connector read [Verify run 3](https://github.com/matboy82/erik-miller/actions/runs/36941259759), its job results, verification logs, and the workflow at that exact revision. This supplements the preceding local baseline; it does not imply that the assistant committed or pushed.

The event was `push`, branch `main`. Job `verify` (110633025301) completed successfully; job `test-deploy` (110633390682) was `skipped`, with no steps executed. Selected actual verification output:

```text
Validated 29 Codex skills and their Markdown references.
ℹ tests 15
ℹ pass 15
ℹ fail 0
Production isolation passed for direction A.
Production isolation passed for direction B.
Production isolation passed for direction C.
Strict mobile gate passed: 3 reports, optimistic LCP 1062.4222 ms < 2500 ms.
```

The pinned workflow requires successful verification, `vars.ENABLE_TEST_DEPLOYS == 'true'`, and a main push or eligible same-repository PR. Successful verification and the main-push condition are established by the run. Therefore the enable-variable condition did not evaluate true. This is an inference from the complete job predicate; the connector cannot inspect the stored repository/environment variable values. An unset/disabled variable or one stored only at environment level fits the observation. GitHub's [variable reference](https://docs.github.com/en/actions/reference/workflows-and-actions/variables), read 2026-10-01, states that environment variables are available only after the job starts and cannot supply the earlier job condition.

Check the repository's **Settings → Secrets and variables → Actions → Variables**: `ENABLE_TEST_DEPLOYS` belongs at repository scope with value `true` when test publication is authorized. Keep `CLOUDFLARE_PAGES_PROJECT` there too; Cloudflare secret values belong in environment `test`. After confirming the intended test project/account and credentials, Matt can rerun all jobs to evaluate the corrected flag. No remote settings were changed and no rerun was triggered during diagnosis. Missing deployment credentials would fail a running job; they do not explain this skipped job.

Remote verification is now observed for the committed candidate. Publication, live URLs/health/noindex, enabled main/PR/fork/failure matrix branches, environment/protection configuration, and placeholder closure remain incomplete.

## Next gate

Origin identifies `matboy82/erik-miller`; confirm that it is the intended repository under the approved BIS boundary. GitHub CLI is unavailable here, and no authenticated remote configuration read was performed. Confirm the Cloudflare account/test project, GitHub `test` environment, restricted secret/variable setup, and protection settings through the [setup guide](../operations/cloudflare-test.md). Secret values stay in the secret store. Explicit commit/push, configuration/deployment, and deliberate F2 failure/fork-test authorization are still needed before the respective actions; alternatively Matt can commit/push the reviewed snapshot himself.

Then execute and record every remote F2 branch and F3/F4 live/configuration check, including actual URLs and partial-failure outcomes. No persistent or preview URL is claimed here. A fresh review session must record code-review and adversarial verdicts in `mr-01.review.md` before release planning. Supply repository instructions, approved artifacts, raw diff/new files, and verification output without this implementation conversation. This is same-session implementation evidence, not independent review or approval of remote actions.
