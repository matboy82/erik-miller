# Grilling Discipline

Interview the user until the idea's decision tree has no unresolved branch within the agreed scope.

## Decision tree and frontier

- Treat each decision as a node. Decisions that depend on it are child nodes.
- The frontier is every unresolved decision whose prerequisites are settled.
- Ask the whole current frontier in one numbered round.
- Keep a dependent question for a later round. Never ask the user to decide something whose prerequisite is still open.
- Recompute the frontier after every answer.

Format each question as:

```md
**Q1 — <short title>:** <question and meaningful options>

**Recommendation:** <recommended answer and why>
```

## Facts and decisions

- Find repository facts with targeted reads, searches, and safe commands.
- Ask the user for product intent, trade-offs, priorities, and domain knowledge that the repository cannot answer.
- Surface contradictions between the user's description, existing artifacts, and code.
- State uncertainty. Do not turn an assumption into a settled decision.

## Scope control

- Agree on the discovery goal before expanding the tree.
- Put attractive but unnecessary branches in `Out of scope` or `Open questions` instead of following them indefinitely.
- If the idea is too large for one useful discovery session, recommend splitting it into smaller discovery topics.

## Completion

The interview is complete only when:

- Every in-scope decision branch is settled, explicitly deferred, or marked blocked.
- Terms used in the decisions have one agreed meaning.
- Remaining open questions name an owner or required source where known.
- The user confirms the shared understanding.

Do not advance into SDD planning before that confirmation.
