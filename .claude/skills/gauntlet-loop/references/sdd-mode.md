# SDD Gauntlet Mode

Use this mode only after resolving the exact governed scope.

## Required inputs

- Approved story and acceptance criteria.
- Approved QA plan, including any required quality threshold.
- Approved developer spec and work-package manifest.
- One selected work-package ID, or an explicit request for the complete sequential manifest.
- Current diff and repository instructions when work has started.
- Quality bar, pinned reference, and comparison protocol.

If the normal SDD inputs are missing, stop and name the first missing gate. Do not use the gauntlet packet to bypass planning or approval.

## Builder prompt

Adapt this template:

```text
Use `/sdd-implement` for [APPROVED WORK-PACKAGE ID]. The governing artifacts are [PATHS]. Preserve their scope, architecture, test seams, allowed files, and verification requirements.

The quality bar is [PINNED REFERENCE], classified as [REQUIRED OR TARGET]. Compare using [APPROVED PROTOCOL AND THRESHOLD]. The bar informs quality but does not add requirements or authorize files, dependencies, contracts, or behavior outside the approved artifacts.

Complete one sequential implementation pass, run the required verification, and capture the normal SDD evidence plus the approved comparison evidence.

Stop after this pass. Do not review your own work, launch another agent, or begin another round.
```

## Critic prompt

Use a separately invoked `code-review` or `adversarial-reviewer` agent. Adapt this template:

```text
Review only. Do not edit files.

Inputs: [APPROVED ARTIFACT PATHS], [CURRENT DIFF], [VERIFICATION EVIDENCE], [PINNED QUALITY BAR], and [COMPARISON PROTOCOL]. Do not use the builder's reasoning or summary.

First, return the normal SDD verdict against the approved artifacts. Then return a separate quality-bar verdict: `Bar met`, `Bar not met`, or `Unverifiable`, with direct evidence and the single largest gap.

A `Target` bar cannot block an otherwise conforming SDD result. A `Required` bar can block only when its threshold is explicit in the approved artifacts. Identify any proposed fix that exceeds the approved work package.

Stop after reporting. Do not implement remediation or launch another agent.
```

## Next-round rule

After review:

- Fix an in-scope implementation defect only through the approved implementation workflow.
- Persist approval of a remediation spec or work package before changes that exceed current scope.
- Ask the human before every additional builder pass.
- Run `/cost-check` before a substantial additional round.
- Stop when the SDD review passes and the human accepts the bar result, or when a genuine blocker is recorded.
