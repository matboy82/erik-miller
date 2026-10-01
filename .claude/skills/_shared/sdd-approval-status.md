# SDD Approval Status Persistence

Apply these rules before the skill's main procedure.

Resolve the active lifecycle from [the shared workflow contract](sdd-workflow-contract.md) and `.claude/sdd-project.md` as defined by [the project-profile rules](sdd-project-profile.md).

## Recognize approval

- Treat an explicit approval or sign-off as approval of the artifact or artifact set clearly named in the current context.
- Treat a direct instruction to begin the next enabled workflow phase as approval of the immediately preceding gate. In the default lifecycle, examples include asking to create stories after an epic, create a QA plan after stories, create a tech spec after QA, implement an approved package, rerun review after remediation, or prepare a release after an approved review.
- Do not infer approval from discussion, requested revisions, a status question, or a conditional statement. A user constraint such as “proceed only if…” remains conditional until satisfied.

## Require answered questions

- Before recording approval, returning an approval verdict, or beginning downstream work, inspect every artifact in the gate for questions explicitly marked open or unresolved.
- An artifact is eligible for approval only when every such question has a concrete answer reflected in the artifact's governing content. The open-questions section must be absent, say `None`, or mark each item resolved with its answer.
- Moving a question to `Out of scope` or a named follow-up counts as an answer only when the human explicitly makes that decision and the artifact records why it cannot change the approved outcome, acceptance criteria, scope, design, test expectations, or rollout.
- If any question remains unanswered, do not persist `Approved`, return `Approve` or `Approve with nits`, or start the next phase. List the exact unanswered questions and request the missing decisions.
- If an input is already marked `Approved` but still contains unanswered questions, treat the artifact as contradictory and block downstream work until the questions are answered and the artifact is reconciled.
- When answers arrive, update both the governing content and the open-questions section before applying the normal approval rules. Answers alone do not imply approval unless the user also explicitly approves or directs the next named workflow.

## Resolve the exact artifacts

- Use the current conversation, active workflow, and next skill's required inputs to identify the immediately preceding artifacts.
- For a multi-file gate, update the complete approved set: all selected story files, or both the developer spec and its work-package manifest.
- Do not approve unrelated drafts in the same directory. If multiple candidates remain genuinely ambiguous, ask for the smallest clarification before beginning downstream work.

## Require human-reviewable artifacts

- Before presenting or recording approval, read and apply [the shared human-reviewability rules](sdd-human-reviewability.md).
- Do not approve an artifact that is needlessly long, repetitive, boilerplate-heavy, or difficult to scan. Keep it `Draft` and revise it without removing material requirements, risks, or decisions.
- If the complete approval contract cannot be made concise, stop and propose a smaller story, spec, or work-package scope.

## Persist before downstream work

1. Update each resolved artifact's status to `**Status**: Approved`. Replace `Draft`, `Awaiting Approval`, or equivalent text; add the field near the top metadata when it is missing.
2. Update stale gate prose, checklist state, or `STOP` text that would still claim approval is pending. Preserve useful history with an `Approval recorded: YYYY-MM-DD` note when appropriate.
3. Make these edits before creating downstream artifacts, editing product code, or running the next workflow's substantive steps.
4. Tell the user which approval statuses were persisted. If the files cannot be updated, stop before the next phase and report the problem.

## New artifacts

- Give every new status-bearing SDD artifact `**Status**: Draft` and retain its human approval gate.
- If the same user request explicitly approves the new artifact, write `Approved` and record the approval instead of leaving a contradictory draft gate.
- Never convert a failed review verdict or incomplete implementation into approval merely because a later workflow was mentioned; only persist the immediately preceding human gate the user actually approved.
