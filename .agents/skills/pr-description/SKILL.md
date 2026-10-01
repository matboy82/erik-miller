---
name: pr-description
description: Write a concise GitHub pull-request description in Markdown covering the story outcome, why the change was needed, how it was approached, what changed, and how it was validated. Use when implementation is ready for a pull request or an existing PR description needs updating.
---

# PR Description

Turn implementation evidence into a short, reviewable PR description. Do not restate the diff line by line and do not editorialize about quality; state the facts a reviewer needs before opening the diff.

## Inputs

- The complete PR change set: existing PR metadata when available, or the branch diff from its merge base through `HEAD`, plus relevant staged or unstaged changes.
- Approved story, epic, developer spec, or diagnostic report when the change went through those gates.
- Linked ticket or issue when one exists.
- Verification evidence: commands run, results, tests added, and any `code-review`/`adversarial-reviewer` verdicts already produced.

If an approved artifact exists, pull Outcome and Why from it rather than re-deriving them from the diff. If none exists (a quick fix, a spike, a one-off), state Why from what the user says and from the diff itself. Do not invent a story that wasn't there.

## Procedure

1. Establish the intended PR base and inspect the complete change set. Do not rely on the working-tree diff alone because committed changes may not appear there. If the base cannot be resolved, state the assumed base in the draft.
2. Read any approved artifacts or verification evidence that belong to this change. Exclude unrelated worktree changes from the description.
3. Write each section per the Output format below.
4. Keep the whole description short enough to read in under a minute. Push detail into linked artifacts (story, spec, diagnostic report, CI run) instead of inlining it.
5. Do not report a check as passed unless it was actually run and the result is known. Name anything that was not verified instead of omitting it.

## Output

Markdown, ready to paste into a GitHub PR description or to hand to a PR-creation tool as the body:

```markdown
## Outcome

[One or two sentences: what capability now exists or what's fixed, from the user's or system's point of view. Not implementation detail.]

## Why

[One or two sentences on the motivating problem or request. Link the approved story/epic/ticket/diagnostic report instead of restating it, when one exists.]

## How

[One short paragraph: the approach or strategy taken, not a step-by-step narrative.]

## What changed

- [Concrete, file- or area-level bullet]
- [Any notable contract touched: route, DTO, schema, config, env var, migration]

## How it was validated

- [Exact commands run and their result, e.g. `npm test` — pass/fail]
- [Tests added or changed, and at what level]
- [Review verdicts already produced, e.g. code-review / adversarial-reviewer]
- [Anything not verified — named explicitly, not left out]
```

## Rules

- State facts, not opinions. Quality commentary belongs in review artifacts, not here.
- Never claim a check passed unless it was actually run.
- Keep "What changed" at the level a reviewer needs to orient themselves, not a full diff narration.
- When the change followed the gated SDD flow, treat the approved artifacts as the source of truth for Outcome and Why. This skill summarizes them; it does not re-approve or reinterpret them.

## Completion

The output is a draft for the user to review and edit before it's attached to a pull request. It is not an approval, a review verdict, or a substitute for `code-review`, `adversarial-reviewer`, or `stakeholder-review`.
