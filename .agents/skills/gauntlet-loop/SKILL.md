---
name: gauntlet-loop
description: Create a manual builder-and-critic prompt packet around a concrete quality bar. Use when the user explicitly asks to gauntlet a build, document, design, research result, or approved SDD work package; keep approved scope fixed, run one agent at a time, and require human direction between rounds.
---

# Gauntlet Loop

Turn a goal into a quality-bar packet: one builder prompt, one isolated critic prompt, and a human-controlled rule for the next round.

Generate prompts only. Do not run the prompts, edit the target, launch agents, or begin a loop unless the user gives a separate execution instruction with the required authority.

## Choose the mode

- Use **SDD mode** when the goal changes a governed product repository and approved SDD artifacts exist or are required. Read [sdd-mode.md](references/sdd-mode.md).
- Use **standalone mode** for writing, design, research, prototypes, or other work outside the gated SDD implementation path. Read [standalone-mode.md](references/standalone-mode.md).

If the mode is unclear, prefer SDD mode when product code, tests, configuration, data, infrastructure, or a release artifact may change.

## Set the quality bar

If the user supplied a reference, evaluate it. Otherwise, offer two or three specific candidate bars and stop for the user's choice.

A usable bar is:

- **Named:** one specific artifact, implementation, standard, suite, or published result.
- **Fetchable:** the builder and critic can access the real reference or a pinned capture.
- **Comparable:** the target and reference can be judged with the same inputs, format, viewport, test, benchmark, or protocol.
- **Relevant:** it measures the user outcome rather than superficial resemblance.
- **Permitted:** comparison does not expose secrets, violate access restrictions, or require copying protected implementation.

Pin a version, date, commit, screenshot, or document edition when the reference can change. Add a measurable threshold when the goal supports one.

For backend and integration work, prefer contract suites, protocol examples, SLOs, benchmarks, failure behavior, or observable results. Do not use code resemblance as the quality bar.

## Classify the bar

- **Required:** the approved acceptance criteria, QA plan, developer spec, or definition of done explicitly makes the threshold mandatory.
- **Target:** the bar is aspirational or comparative. It informs quality but cannot block an otherwise conforming SDD result unless a human approves it into the governing artifacts.

In SDD mode, the approved artifacts are the contract. A quality bar never adds scope, changes architecture, replaces repository conventions, or authorizes edits.

## Set the round boundary

Each round contains:

1. One builder pass on one approved or explicitly named piece.
2. One separate critic pass using fresh context and raw artifacts rather than builder reasoning.
3. A human decision to stop, accept a limitation, approve remediation, or begin another round.

Never run builder and critic concurrently. Never start another round automatically. Run `$cost-check` before an expensive first round and before any substantial additional round.

## Output

Return one compact packet with:

1. **Quality bar:** reference, pinned version, comparison protocol, threshold when applicable, and `Required` or `Target` classification.
2. **Builder prompt:** paste-ready and limited to the selected piece.
3. **Critic prompt:** paste-ready, review-only, and isolated from builder reasoning.
4. **Next-round rule:** the exact human decision required after the critic reports.

Do not add a live progress page, fanout instruction, automatic agent launch, hidden file write, or open-ended `loop until it wins` instruction.

## Completion

The packet is complete only when the bar is concrete, the scope is exact, the builder and critic roles are separated, and the next round requires explicit human direction.
