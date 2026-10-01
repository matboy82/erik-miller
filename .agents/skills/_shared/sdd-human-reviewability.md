# Human-Reviewable SDD Artifacts

Apply these rules to every status-bearing or approval-gated SDD artifact and to persisted review, remediation, or release artifacts used as gate evidence.

## Optimize for the approval decision

- Put the outcome, scope, decisions, material risks, and approval gate before supporting detail.
- Include only information that changes scope, behavior, design, verification, rollout, or the approval decision.
- Use direct language, short paragraphs, bullets for discrete facts, and tables only for repeated mappings such as acceptance-criterion traceability.
- State each requirement or decision once. Link to supporting evidence or repository context instead of copying it. Keep every normative requirement and approval decision in the artifact being approved.
- Omit irrelevant sections. Use a one-line `Not applicable` only when reviewers need explicit confirmation that an important risk area was considered.
- Do not include discovery history, generic engineering advice, speculative implementation detail, long code samples, exhaustive file inventories, or prose that merely restates a diagram or table.

## Stay complete

Simple and concise does not mean incomplete. Keep every material item that applies:

- stakeholder outcome, scope, non-goals, and acceptance criteria;
- contract, data, security, compatibility, operational, rollout, and rollback constraints;
- dependencies, approved test seams, verification expectations, and required quality bars;
- governing ADRs or the `ADR not required` rationale;
- answered open questions and explicit follow-ups or out-of-scope decisions.

If this material cannot be presented so a reviewer can understand the approval decision quickly, narrow or split the story, spec, or work package before requesting approval. Do not hide complexity by deleting a material constraint.

## Edit before the gate

Before presenting an artifact for approval or recording approval:

1. Remove repeated background, requirements, decisions, and evidence.
2. Replace narrative with a smaller list or mapping when that preserves meaning.
3. Remove boilerplate and sections that do not apply.
4. Confirm that every statement is necessary for the decision or points to evidence that is.
5. Confirm that a reviewer can identify what this artifact asks them to approve, its scope boundaries, material risks, and success evidence without reconstructing that gate's decision from several files.
6. Apply the shared open-question gate. An artifact with unanswered questions is not approval-ready.

Keep the artifact `Draft` and revise it when this check fails. If concision requires dropping material information, stop and propose a smaller scope instead.
