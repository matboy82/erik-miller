# SDD Tool Adapter Contract

Use external systems through capabilities, not vendor names embedded in phase logic.

## Capabilities

A project profile may bind any of these capabilities to a local skill, MCP server, app, CLI, API, or manual handoff:

- `work-item.read`, `work-item.write`
- `knowledge.search`, `knowledge.read`, `knowledge.write`
- `source.read`, `pull-request.read`, `pull-request.write`
- `ci.read`, `release.read`, `release.write`
- `communication.read`, `communication.write`

Teams may define additional capabilities when a phase-specific skill owns their contract.

## Adapter declaration

For each configured capability, record:

- provider and adapter name;
- how availability is checked;
- required inputs and stable identifiers;
- expected output or evidence;
- whether it reads or writes external state;
- authorization or approval required immediately before a write;
- local or manual fallback when unavailable.

Never store credentials in the profile or artifact.

## Runtime rules

1. Resolve the capability from `.claude/sdd-project.md` only when the current phase needs it.
2. Check that the declared adapter is available before depending on it.
3. Prefer local repository artifacts when they are authoritative and current.
4. If an optional read adapter is unavailable, continue with local or user-provided evidence and name the limitation.
5. If a required identity or authoritative source cannot be obtained, stop and request the smallest missing input.
6. External writes require the user's authorization and the adapter's normal safety checks. Approval of an SDD artifact does not authorize a tracker, documentation, pull-request, release, or communication write.
7. Record stable external links or IDs in the relevant artifact when the profile requires them.

Core SDD skills must describe needed capabilities in these terms. Provider-specific mechanics belong in the configured adapter skill or project profile.

Use [the adapter-skill template](../../../docs/templates/sdd-tool-adapter.md) when a team needs to create a provider-specific skill.
