# SDD Project Profile

Use the target repository's instructions and optional `.agents/sdd-project.md` to adapt the shared SDD workflow without editing its core skills.

## Resolution order

1. Read the target repository's `AGENTS.md` and applicable `.agents/rules/`.
2. Read `.agents/sdd-project.md` when it exists.
3. Use the defaults below for values the profile does not override.
4. Detect remaining technology and repository facts from files on disk. Do not ask the user for facts that are cheap to discover.

Repository instructions and the profile may strengthen safety, evidence, or approval requirements. They must not weaken the shared approval, open-question, ADR, reviewability, or verification gates.

## Configurable fields

A project profile may define:

- **Work-item identity:** provider name, human-facing label, key pattern, filename normalization, whether an external item is required, and the adapter used to read or update it.
- **Artifact paths:** path templates for briefs, epics, stories, QA plans, specs, work packages, reviews, stakeholder reviews, release plans, diagnostics, and ADRs.
- **Repository discovery:** orientation documents, project manifests, source roots, test roots, infrastructure roots, generated-code boundaries, and ownership maps.
- **Verification:** commands or command-discovery rules for targeted tests, suites, coverage, static analysis, builds, contracts, integration tests, and formatting.
- **Tool adapters:** capabilities and preferred local skill, MCP server, app, CLI, or API adapter, following the shared tool-adapter contract.
- **Workflow extensions:** additional phases following the shared workflow extension contract.
- **Workflow support paths:** local support artifacts such as onboarding logs that do not replace or govern core SDD artifacts.

Do not encode secrets, tokens, or environment-specific credentials in the profile.

## Defaults

When no profile exists:

- Use Jira-style keys supplied by a human as the work-item identity and label metadata `Jira story`.
- Normalize the key to lowercase for filenames.
- Use the default artifact paths in the shared artifact contract.
- Discover orientation files and manifests with targeted file search. Common manifests are evidence, not requirements; never assume `package.json` or a particular stack exists.
- Read verification commands from repository instructions and detected build configuration.
- Treat external tools as optional until a phase needs a capability that local artifacts cannot provide.
- Use the default phase sequence in the shared workflow contract.

Use [the project-profile template](../../../docs/templates/codex-sdd-project.md) when a team needs overrides. Do not require a profile for repositories that fit the defaults.
