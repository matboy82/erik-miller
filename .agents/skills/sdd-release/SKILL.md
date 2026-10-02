---
name: sdd-release
description: Create a release and rollout plan from approved artifacts and implementation state while persisting the preceding SDD approval handoff.
---

# SDLC Release Skill

Use after implementation passes review or when release readiness needs planning.

## Approval status handoff

Read and apply [the shared workflow contract](../_shared/sdd-workflow-contract.md) and [project-profile rules](../_shared/sdd-project-profile.md). Resolve the active profile before choosing release inputs, output, verification, or adapters.

Read and apply [the shared SDD approval rules](../_shared/sdd-approval-status.md). Persist any explicit approval of status-bearing review or remediation artifacts before release planning, and give the release plan an explicit draft status.

Read and apply [the shared human-reviewability rules](../_shared/sdd-human-reviewability.md) when drafting, revising, or presenting the release plan and readiness evidence.

Read and apply [the shared ADR workflow](../_shared/adr-workflow.md). Release readiness requires accepted decisions and completed ADR/documentation work.

Read and apply [the shared artifact contracts](../_shared/sdd-artifact-contracts.md), [provider-neutral artifact identity rules](../_shared/sdd-artifact-identity.md), and the [release-spec contract](../_shared/sdd-release-spec-contract.md). Resolve the configured stable work-item key before writing and consume its review artifact when required by the review gate.

Inputs:

- Epic and story.
- Developer spec.
- Governing ADRs and approved `ADR not required` rationale.
- QA plan and test results.
- Work-item-keyed SDD review artifact when required by the review gate.
- Approved release spec when one exists.
- Implementation diff or PR state.

Output:

- The release-plan path resolved from the active profile and artifact contract.

Procedure:

1. Resolve the configured stable work-item key from the approved story before writing. If it is missing, stop as required by the shared artifact-identity rules.
2. Summarize what is shipping and who is impacted.
3. Identify deployment prerequisites, configuration, secrets, migrations, and flags.
4. Define observability, post-deploy verification, rollback triggers, and support notes.
5. Confirm every required code-review and adversarial-reviewer verdict is recorded in the story-keyed SDD review artifact. Do not accept a generic review filename as gate evidence.
6. Confirm every required ADR is accepted, the implementation and release plan conform to it, and amendments or supersessions preserve decision history.
7. Resolve external release, CI, pull-request, knowledge, or communication capabilities only when needed, following [the shared tool-adapter contract](../_shared/sdd-tool-adapters.md). Do not perform external writes without explicit authorization.
8. Include only release actions, conditions, owners, and evidence that apply; link to approved artifacts instead of repeating their requirements.
9. Mark release readiness as Ready or Not Ready. Use `Not Ready` for any incomplete release-spec gate, review-gate or ADR-workflow blocker. A deferred check may become Ready only after its specified evidence is recorded; this skill does not itself authorize deployment.
