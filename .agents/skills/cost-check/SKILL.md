---
name: cost-check
description: Check whether the requested Codex workflow is scoped and cost-conscious.
---

# Cost Check Skill

Use before a large SDLC step or when the user asks about cost.

Checklist:
- Is the current phase clear?
- Are approved input artifacts present?
- Can this be done with a skill in the current session instead of an agent?
- Is an agent needed for context isolation or specialized review?
- Is the current model and scope adequate without an unnecessary escalation?
- Is the scope limited to one story or work package?
- Are fanout and automatic parallelism avoided?
- For a gauntlet, is the bar pinned, the current piece exact, and the round limited to one builder pass plus one separate critic pass?
- Will a human explicitly approve any additional gauntlet round?

Recommended defaults:
- Use focused reads for narrow story slicing or discovery.
- Preserve the user-selected Codex model for planning, implementation, and review.
- Report a hard architecture/debugging blocker before broadening expensive work.
- Default a gauntlet to one manual round before the next cost and continuation decision.
