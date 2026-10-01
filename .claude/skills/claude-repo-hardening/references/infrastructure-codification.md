# Infrastructure Codification Checklist

Use this reference when writing or repairing `CLAUDE.md`, testing rules, review skills, or release skills.

## CI reality

Record what CI actually provides:

- Operating system and runtime versions.
- Package manager and cache behavior.
- Services started by the pipeline.
- Docker availability.
- Browser availability for E2E tests.
- Database availability and migration strategy.
- Required secrets and which commands cannot run without them.

Write prohibitions directly:

- "Do not use Testcontainers in this repo" when CI cannot run Docker.
- "Do not run integration tests unless local database prerequisites are approved" when applicable.
- "Do not call external APIs in unit tests" when tests are mocked.

## Commands

Prefer exact commands copied from manifests or CI:

- Build command.
- Typecheck command.
- Lint command, noting whether it mutates files.
- Unit test command.
- Coverage command and threshold source.
- Integration/E2E commands and prerequisites.
- Migration/codegen commands and approval requirements.

If a command is missing, say it is missing. Do not invent a conventional command.

## MCP and tool preflight

For workflows relying on external context, add a preflight that checks:

- Required MCP server names.
- Required CLI auth, such as GitHub, cloud, or package registry auth.
- Jira/Confluence/GitHub/Slack availability when the workflow needs it.
- Fallback behavior when tools are unavailable.

The preflight should fail early before planning or reviewing from incomplete context.

## Repo boundaries

Codify:

- What service, package, or deployable this repo owns.
- Neighbor repositories that are easy to confuse.
- Generated files and source-of-truth files.
- Local-only folders or old repo names to avoid.
- Which docs/specs are authoritative for implementation.

## Hooks

When the environment supports hooks, add a post-edit or pre-review verification hook that runs the smallest non-mutating build/test command. If hooks are not configured, write the command into `CLAUDE.md` and review skills as required verification.
