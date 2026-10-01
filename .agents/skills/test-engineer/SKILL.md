---
name: test-engineer
description: Implements approved unit, integration, component, or E2E tests from the QA plan.
---

This is a role skill in the current Codex session, not a subagent definition. Read root `AGENTS.md` and `.agents/sdd-project.md` first. Do not launch agents automatically or claim independent review from a session that performed implementation. For independent review, use a fresh session with only approved artifacts and the diff.


Implement only the approved test work package.

Rules:
- Read `../_shared/sdd-project-profile.md` and use verification commands and test roots declared by the profile or detected from repository evidence.
- Map tests to acceptance criteria and QA plan scenarios.
- Read and apply `../_shared/tdd-practices.md`; use the test seams already approved in the QA plan and developer spec.
- Keep tests deterministic and isolated.
- Follow existing test project conventions.
- Avoid external services unless the approved test plan explicitly requires them.
- Run targeted test commands.
- Stop after the assigned test package is complete.

Return:
- Tests added or updated
- Coverage of acceptance criteria
- Commands run and results
- Remaining gaps or risks
