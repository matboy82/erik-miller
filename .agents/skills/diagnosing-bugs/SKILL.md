---
name: diagnosing-bugs
description: Diagnose hard bugs, failures, and performance regressions by building a tight reproduction, minimizing it, testing falsifiable hypotheses, and writing a durable diagnostic report. Use for diagnosis only; do not implement the remediation unless the user separately approves the normal SDD implementation scope.
---

# Diagnosing Bugs

Find and support the root cause. Stop before remediation.

## Default authority

- Treat a request to diagnose as read-only authority over product code.
- Run safe diagnostic commands and write the diagnostic report.
- Use the OS temporary directory for throwaway harnesses and captured, redacted evidence.
- Ask before adding instrumentation, tests, scripts, or other files to the product repository.
- If temporary repository edits are approved, record the exact original content and restore it with focused edits before finishing.
- Never commit, push, or implement the fix as part of diagnosis.

## Inputs

- The reported symptom and expected behavior.
- The target repository and relevant environment.
- Logs, traces, payloads, screenshots, or reproduction steps when available.
- Optional `CONTEXT.md`, `CONTEXT-MAP.md`, and relevant ADRs when they exist.

## Secret handling

Redact credentials, tokens, cookies, authorization headers, personal data, and other secrets before quoting commands or evidence. Use `<REDACTED>` in the report. Keep credentials in environment variables rather than command text.

## Phase 1: build a tight signal

Create one command that can detect the user's exact symptom. Prefer, in order:

1. An existing targeted test.
2. A curl or API script against a safe environment.
3. A CLI command with a fixture and expected output.
4. A browser script that checks the relevant DOM, console, or network behavior.
5. Replay of a redacted captured request, event, or trace.
6. A throwaway harness in the OS temporary directory.
7. A deterministic stress, differential, or bisection loop.

The signal is ready only when it is:

- **Specific:** detects the reported symptom, not merely any failure.
- **Repeatable:** produces the same verdict, or a measured high reproduction rate for a flaky bug.
- **Focused:** runs the smallest practical path.
- **Runnable:** can be repeated without hidden manual steps.

If no trustworthy signal can be built, stop and write what was tried and what access or evidence is missing. Do not replace evidence with speculation.

## Phase 2: reproduce and minimize

1. Run the signal and capture redacted evidence of the reported symptom.
2. Confirm it is the same bug the user described.
3. Remove inputs, configuration, data, callers, and steps one at a time.
4. Re-run after each reduction.
5. Stop when each remaining element is needed to reproduce the symptom.

## Phase 3: test hypotheses

1. Write three to five ranked hypotheses.
2. For each, state a falsifiable prediction: `If <cause>, then <probe> will produce <result>.`
3. Prefer the least invasive probe that separates the leading hypotheses.
4. Change one variable at a time.
5. Use a debugger or focused boundary logging instead of broad logging.
6. Tag approved temporary logs with a unique marker and remove all of them before finishing.
7. For performance regressions, measure a baseline and compare profiles, query plans, versions, or configurations.

## Phase 4: establish the diagnosis

A root cause is supported only when:

- The evidence explains the complete minimized reproduction.
- A probe predicted by the hypothesis changes the signal as expected.
- Competing hypotheses are falsified or made materially less likely.
- The explanation identifies the failing code path, contract, data condition, configuration, dependency, or environment boundary.

If the evidence remains mixed, report `Inconclusive` and the smallest next probe. Do not force a confident conclusion.

## Phase 5: define remediation without implementing it

Read [the shared TDD practices](../_shared/tdd-practices.md) before proposing the regression test. If the correct seam is unclear because the current interface leaks or hides behavior, use [the shared codebase-design lens](../_shared/codebase-design.md) to describe the design question without refactoring it.

Describe:

- The smallest behavior change likely to remove the cause.
- The correct public seam for a regression test.
- The proposed test case and expected independent result.
- Likely files, contracts, callers, data, and operational concerns affected.
- The expected blast radius and verification commands.
- Any approved artifact that must change before implementation.

Use [diagnostic-report.md](references/diagnostic-report.md) to write `docs/diagnostics/<bug-slug>.md` unless the repository has another diagnostic convention.

## Handoff

- For a product behavior change, use the diagnostic report as input to the normal story, QA, technical-spec, work-package, and implementation gates.
- A later direct request to fix the bug does not retroactively make diagnostic edits permanent.
- Do not call the report an approved remediation plan.

Required gate:
`STOP: Diagnosis is complete or blocked. No remediation has been implemented.`
