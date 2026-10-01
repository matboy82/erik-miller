# Standalone Gauntlet Mode

Use this mode for an artifact outside the gated SDD implementation path.

## Required scope

Resolve before writing the packet:

- The goal and current piece to improve.
- Allowed output locations or delivery format.
- The quality bar and comparison protocol.
- Any user-provided tool, spend, time, or iteration limit.

## Builder prompt

Adapt this template:

```text
Create or improve [CURRENT PIECE] for [GOAL].

The quality bar is [PINNED REFERENCE]. Compare using [PROTOCOL AND THRESHOLD]. Get the real reference before working; do not compare against a remembered description.

Work only on [EXACT SCOPE AND ALLOWED OUTPUTS]. Produce the artifact and the evidence needed for an independent comparison. Follow [RELEVANT CONSTRAINTS].

Stop after this builder pass. Do not judge your own work, launch a critic, broaden the scope, or begin another round.
```

## Critic prompt

Adapt this template:

```text
Review only. Do not edit the artifact.

Using only [ACTUAL ARTIFACT], [PINNED QUALITY BAR], and [COMPARISON PROTOCOL], compare both under the same conditions. Do not use the builder's reasoning or effort as evidence. Remove labels for a blind comparison when practical.

Return `Bar met`, `Bar not met`, or `Unverifiable`. Cite the comparison evidence and name the single largest remaining gap. Separate a failed threshold from an optional improvement.

Stop after the verdict. Do not launch a builder or begin another round.
```

## Next-round rule

After the critic reports, the human chooses one:

- Accept the result.
- Accept a named limitation.
- Approve one more builder pass focused on the critic's largest gap.
- Replace an unusable bar or protocol.
- Stop the effort.

Carry only the raw artifact, quality bar, protocol, verdict, and approved next gap into the next builder pass.
