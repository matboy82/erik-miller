# Diagnostic Report Format

```md
# <Bug or symptom>

**Outcome**: Root cause supported | Inconclusive | Blocked
**Date**: YYYY-MM-DD
**Target**: <repository, service, environment, or version>

## Reported behavior

- Expected:
- Observed:
- Impact:

## Reproduction signal

**Command:** `<redacted exact command>`

**Why it detects this bug:** <specific assertion or symptom>

**Result:** <repeatability, timing, and redacted evidence>

## Minimized reproduction

- Required inputs:
- Required state or configuration:
- Required steps:
- Removed as irrelevant:

## Hypotheses and probes

| Rank | Hypothesis | Prediction and probe | Result | Status |
|---|---|---|---|---|
| 1 | | | | Supported or falsified |

## Root cause

<Evidence-backed explanation, or why the result remains inconclusive.>

## Proposed remediation

- Behavior change:
- Regression-test seam:
- Proposed test:
- Expected files or contracts:
- Blast radius:
- Verification:

## Risks and unknowns

- <remaining risk, missing access, or assumption>

## Cleanup

- Temporary repository edits restored: Yes | No | Not used
- Temporary instrumentation removed: Yes | No | Not used
- Secrets and personal data redacted: Yes | No

## Next gate

STOP: This report supports planning. It does not approve or implement remediation.
```
