---
name: cost-check
description: Check whether the requested Claude workflow is scoped and cost-conscious.
---

# Cost Check Skill

Use before a large SDLC step or when the user asks about cost.

Checklist:
- Is the current phase clear?
- Are approved input artifacts present?
- Can this be done with a skill in the current session instead of an agent?
- Is an agent needed for context isolation or specialized review?
- Is Opus unnecessary for this step?
- Is the scope limited to one story or work package?
- Are fanout and automatic parallelism avoided?
- For a gauntlet, is the bar pinned, the current piece exact, and the round limited to one builder pass plus one separate critic pass?
- Will a human explicitly approve any additional gauntlet round?

Recommended defaults:
- Use Haiku for narrow story slicing or read-only discovery.
- Use Sonnet for QA plans, developer specs, implementation, and review.
- Use Opus only for hard architecture/debugging blockers, then return to Sonnet.
- Default a gauntlet to one manual round before the next cost and continuation decision.
