---
name: grill-with-docs
description: Run an optional, codebase-aware discovery interview before SDD planning; sharpen domain language, record proposed decisions, and create a draft product brief. Use only when the user explicitly asks to grill, discover, or stress-test an idea before creating an epic or spec.
---

# Grill With Docs

Run an optional discovery phase before the normal SDD workflow. Existing `sdd-*` skills must continue without these artifacts when this skill was not used.

## Inputs

- The idea, problem, plan, or design to explore.
- The target product repository.
- Existing product notes, code, `CONTEXT.md` or `CONTEXT-MAP.md`, and ADRs when present.

## Required references

Before asking questions, read and apply all three references:

- [grilling.md](references/grilling.md) for the interview loop.
- [domain-modeling.md](references/domain-modeling.md) for terminology and decisions.
- [artifact-formats.md](references/artifact-formats.md) for durable outputs.

Do not rely on another skill being loaded implicitly. These references make this workflow self-contained.

## Procedure

1. Confirm the target repository and the idea being explored.
2. Read repository instructions and any existing brief, glossary, context map, and relevant ADRs.
3. Build a decision tree and work its current frontier in rounds. Find facts through targeted, read-only inspection; ask the user only for decisions or unavailable domain knowledge.
4. Maintain domain language as decisions settle:
   - Update the applicable `CONTEXT.md` only for stable, domain-specific terms.
   - Offer a proposed ADR only for a hard-to-reverse, surprising trade-off.
   - Never put implementation detail in `CONTEXT.md`.
5. When the outcome has a meaningful external or measurable comparison, ask whether the user wants a quality bar. If so, apply [the Gauntlet Loop bar criteria](../gauntlet-loop/SKILL.md) and capture the proposed reference, protocol, threshold, and classification. Do not force a bar onto work that is fully defined by its product outcome.
6. When the frontier is empty, show the settled decisions, remaining open questions, scope boundaries, and any proposed quality bar. Ask the user to confirm that shared understanding is complete.
7. After confirmation, create or update `docs/product/briefs/<feature-slug>.md` with `**Status**: Draft` unless the user named another brief path.
8. Report every file created or updated and recommend `$sdd-epic` as the next optional step.

## Boundaries

- Do not design the implementation beyond what is needed to expose a product or architectural decision.
- Do not edit product code, create stories, write a QA plan, or start implementation.
- Do not launch agents automatically. Use the current session for targeted discovery unless the user manually chooses an agent.
- Do not mark the brief, an ADR, an epic, or any downstream artifact approved.
- Do not require a glossary, ADR, or discovery brief in later SDD phases. They are enrichment artifacts, not prerequisites.

Required gate:
`STOP: Human confirms discovery is complete before the draft brief is handed to $sdd-epic.`
