---
name: team-onboarding
description: Guide an engineer or adopting team through this portable SDD toolkit in a target repository using a real, low-risk work item, configured workflow phases, tool adapters, and explicit human gates.
---

# Team Onboarding

Use the target repository's real SDD workflow. Onboarding adds supervised checkpoints; it does not create a parallel process or authorize product changes.

## Resolve the onboarding contract

Read and apply:

- [the project-profile rules](../_shared/sdd-project-profile.md) and the target repository's instructions to resolve paths, identity, verification, adapters, and enabled extensions;
- [the workflow contract](../_shared/sdd-workflow-contract.md) to teach the active phase order and gates;
- [the artifact contracts](../_shared/sdd-artifact-contracts.md) and [identity rules](../_shared/sdd-artifact-identity.md) to explain portable artifacts and stable work-item keys;
- [the tool-adapter contract](../_shared/sdd-tool-adapters.md) to explain capabilities, availability checks, authorization, and fallbacks;
- [the approval rules](../_shared/sdd-approval-status.md) and [human-reviewability rules](../_shared/sdd-human-reviewability.md) at every supervised gate.

## Inputs

- Person or team name and a safe log slug.
- Target product repository.
- Approved low-risk work item with its configured stable identity.
- Current onboarding phase; onboarding may span sessions.

If no suitable work item exists, stop and ask the onboarding lead to select one through the normal planning process. Do not invent an external key or bypass its approval gate.

## Onboarding log

Use the profile's onboarding-log path when configured; otherwise use `docs/onboarding/<log-slug>.md`. Keep the log concise and record:

- toolkit version and target profile used;
- current phase and completed gates;
- enabled workflow extensions;
- adapter availability or manual fallbacks exercised;
- help needed, grouped as process, domain, repository, or tooling;
- open questions, their answers, or an explicit out-of-scope/follow-up decision;
- next checkpoint and owner.

This skill may create or update only the onboarding log. Product-repository artifacts and code remain under their owning SDD skills and approval gates.

## Phase 0: Orient

1. Read the target repository's instructions and optional `.claude/sdd-project.md`. Read a local copy of `docs/how-to/team-ai-tooling.md` when present; otherwise use the shared contracts linked above.
2. Compare the default lifecycle with the target's enabled extensions. Have the learner identify each phase's input, output, evidence, and human gate.
3. Show how the target maps capability names to its tracker, knowledge, source, CI, release, and communication tools. Use read-only availability checks when useful; do not perform external writes.
4. Have the learner explain the configured work-item identity, artifact paths, verification discovery, and adapter fallbacks.

Checkpoint: the learner can find the current gate, next enabled phase, authoritative artifact, and required tool capability without assuming a provider or technology stack.

## Phase 1: Shadow a completed cycle

Walk one completed cycle as a read-only tour:

1. Follow the active workflow through its epic, stories, QA plan, developer spec, work packages, review, release plan, and required extension artifacts.
2. At each human gate, show the outcome, scope, decisions, material risks, verification, and approval question. Point out how repeated background and irrelevant sections were removed.
3. Show that every open question was answered or explicitly moved out of scope before approval.
4. Connect code-review and any required adversarial verdict to the evidence and review rule that governed it.

Checkpoint: the learner can explain what approved each artifact and what would have blocked it.

## Phase 2: Run a supervised pass

1. Confirm the selected work is Low blast radius under the target repository's review rules and excludes authorization, tenant isolation, persistence/schema changes, shared dependencies, external effects, and known high-risk defect classes. Choose another work item if it does not qualify.
2. Start at the work item's current enabled phase and use the real owning skills, including required extension skills.
3. Resolve commands and repository conventions from the target profile and repository evidence. Resolve external needs through configured capabilities and adapters.
4. Require the onboarding lead's explicit approval at every human gate. Before approval, apply the shared open-question and concise-reviewability checks. The learner must not approve their own artifact during this phase.
5. Record the evidence, adapter or fallback used, and help needed at each checkpoint without copying the artifact into the log.

Checkpoint: every reached gate has explicit approval, answered questions, concise decision evidence, and notes about any help or fallback.

## Phase 3: Assess readiness

Write a short readiness result in the onboarding log:

- gates completed independently and with help;
- ability to follow the active profile, extensions, identity, verification, and adapters;
- remaining follow-ups or unresolved blockers;
- recommendation: ready for similar work, another supervised pass, or one named gap to address.

Do not mark the learner ready while an approval-critical question or required tool/repository gap remains unresolved.

Required gate:
`STOP: Current onboarding phase is complete. The onboarding lead confirms readiness before the next phase or gate.`
