# Discovery Artifact Formats

## Product brief

Write `docs/product/briefs/<feature-slug>.md` unless the repository defines another location.

```md
# <Feature name>

**Status**: Draft

## Problem

<Who has what problem, and why it matters.>

## Target users

- <user or stakeholder>

## Desired outcomes

- <observable outcome>

## In scope

- <product behavior or capability>

## Out of scope

- <explicit boundary>

## Constraints

- <business, policy, operational, compatibility, or delivery constraint>

## Settled decisions

- <decision and short reason>

## Open questions

- <question, owner or source if known>

## Quality bar (optional)

- Reference and pinned version: <specific artifact, suite, standard, or result>
- Why it is relevant: <user outcome it helps judge>
- Comparison protocol: <same inputs, environment, format, viewport, test, or benchmark>
- Proposed threshold: <measurable result when applicable>
- Proposed classification: Required | Target

This classification remains proposed until it is approved through the epic, QA plan, or another governing artifact.

## Related context

- <links to applicable CONTEXT.md sections and proposed or accepted ADRs>

## Next gate

STOP: This draft brief may be used as input to `/sdd-epic`; it does not approve an epic or implementation.
```

## Domain glossary

```md
# <Context name>

<One or two sentences describing the context.>

## Language

**Order**

The customer's confirmed request for goods or services.

_Avoid_: Purchase, transaction
```

Choose one term for one concept. Keep each definition to one or two sentences and omit implementation details.

## Context map

Use a context map only when the repository has genuinely separate domains.

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md) — receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md) — requests and records payment

## Relationships

- **Ordering → Billing**: Ordering sends the accepted order needed to create an invoice.
```

## Proposed ADR

Write ADRs under the repository's established ADR directory. If none exists, use `docs/architecture/decisions/` and the next four-digit sequence number.

```md
---
status: proposed
---

# <Short decision title>

<One to three sentences describing the context, proposed decision, and reason.>
```

Add considered options or consequences only when they help a future reader understand the trade-off.
