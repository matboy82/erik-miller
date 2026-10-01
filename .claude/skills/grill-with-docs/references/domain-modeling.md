# Domain Modeling Discipline

Build a small, durable language for the target product while discovery decisions settle.

## Read before writing

1. If `CONTEXT-MAP.md` exists, use it to find the applicable context.
2. Otherwise, read the root `CONTEXT.md` when present.
3. Read relevant ADRs before proposing terminology or revisiting a decision.
4. Check code when the user's description conflicts with current behavior.

## Maintain the glossary

- Challenge overloaded terms: ask which precise concept the user means.
- Propose one canonical term and list discouraged synonyms.
- Test definitions with concrete edge cases and relationships.
- Add only domain-specific concepts. Exclude programming terms, implementation notes, requirements, and scratch decisions.
- Define what a term is in one or two sentences.
- Create `CONTEXT.md` lazily, when the first stable term is agreed.
- In a multi-context repository, update only the applicable context and keep relationships in `CONTEXT-MAP.md`.

## Record architectural decisions sparingly

Offer an ADR only when the decision is all three:

1. Hard to reverse.
2. Surprising without its context.
3. The result of a real trade-off.

Create discovery ADRs with `Status: Proposed`. A later explicit human decision may accept them. Do not treat completion of the grilling session as automatic ADR acceptance.

## Preserve optionality

- Downstream SDD workflows may read glossary and ADR artifacts when present.
- Their absence must never block epic, story, QA, technical planning, implementation, review, or release work.
- When no domain artifact exists, use the approved SDD artifacts and repository language already in place.
