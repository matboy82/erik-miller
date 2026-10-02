# SDD Workflow and Extension Contract

This contract defines the stable lifecycle. Project profiles may add phases, but cannot bypass its gates.

## Default lifecycle

1. Optional discovery produces a draft brief and optional domain context.
2. Epic defines the product outcome and scope; human approval is required.
3. Stories define small observable slices; human approval is required.
4. QA plan defines risks, test seams, and evidence; human approval is required.
5. Technical planning defines the developer spec, work packages, any required release spec, and required proposed ADRs; human approval is required.
6. Implementation executes only approved packages and produces evidence.
7. Review returns an evidence-based verdict and approved remediation when needed.
8. Release planning defines readiness, rollout, verification, and rollback.

Every phase must name its required inputs, outputs, owner skill, entry condition, completion evidence, and next human gate. A downstream phase may consume only artifacts whose required gate is complete.

## Add a phase

Declare an extension under `Workflow extensions` in `.agents/sdd-project.md` with:

- stable phase ID and purpose;
- owning skill path or invocation name;
- `Required` or `Optional` classification;
- predecessor and successor phase IDs;
- required inputs and produced artifacts;
- status field and human approval gate, when the output governs downstream work;
- completion evidence and failure/stop conditions.

An extension must have one clear insertion point. It may strengthen evidence or add a team-specific deliverable, but must not silently change an approved artifact, relax a core gate, convert an optional artifact into an undeclared prerequisite, or authorize side effects.

When a required extension is enabled, the predecessor's next-phase instruction targets it and its approved output becomes an input to the successor. When an optional extension is absent or skipped, follow the default lifecycle normally.

## Add an artifact type

Define the artifact's owner phase, stable identity, path template, required metadata, minimum decision content, approval status, and downstream consumers. Add its rules to a direct reference owned by the creating skill; do not expand every unrelated skill.

## Handoff rule

A direct instruction to begin the next enabled phase may approve only the immediately preceding gate after all shared approval conditions pass. If phase order is ambiguous, stop and resolve the active profile and current artifact statuses before doing downstream work.
