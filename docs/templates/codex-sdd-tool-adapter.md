# SDD Tool Adapter Skill Template

Copy this structure to `.agents/skills/<adapter-name>/SKILL.md` when a target repository needs a provider-specific integration. Replace every placeholder and keep the adapter focused on one capability or one closely related capability group.

```markdown
---
name: <adapter-name>
description: <Provider-specific action and the SDD capability it supplies. State when to use it.>
---

# <Adapter title>

Supplies: `<capability>`

## Inputs

- Stable identifier: `<required identifier>`
- Phase context: `<artifact or fields required>`

## Availability check

Describe the smallest read-only check that proves the connector, skill, CLI, or API is available and authenticated.

## Procedure

1. Validate required inputs without inventing identifiers.
2. Perform the provider-specific read or prepare the exact proposed write.
3. For a write, obtain explicit authorization immediately before changing external state.
4. Return the evidence contract below.

## Evidence contract

- Capability and provider
- Stable external ID or link
- Read or write performed
- Result and timestamp when relevant
- Material fields consumed or changed
- Limitation, error, or fallback used

## Failure and fallback

State which failures block the phase and which may use local artifacts, user-provided evidence, or a manual handoff.

## Safety

- Never store or print credentials.
- Do not treat approval of an SDD artifact as authorization for an external write.
- Do not broaden the requested capability or update unrelated records.
```

Declare the adapter under `Tool adapters` in `.agents/sdd-project.md`. Core SDD skills continue to request the capability name; they must not call this provider by name.
