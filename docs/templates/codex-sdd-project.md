# SDD Project Profile

Copy this file to `.agents/sdd-project.md` only when the repository needs to override the toolkit defaults. Delete sections that keep the default behavior.

## Work-item identity

- Provider: `<Jira | Azure DevOps | GitHub Issues | Linear | local | other>`
- Metadata label: `<Jira story | Work item | Issue | other>`
- Human-assigned key pattern: `<pattern or example>`
- Filename normalization: `<lowercase | provider rule | safe custom rule>`
- External item required: `<yes | no>`
- Read adapter capability: `<work-item.read adapter or manual>`
- Write adapter capability: `<work-item.write adapter or none>`

## Artifact paths

- Brief: `<path template>`
- Epic: `<path template>`
- Story: `<path template containing work-item key>`
- QA plan: `<path template>`
- Developer spec: `<path template containing work-item key>`
- Work packages: `<path template containing work-item key>`
- Review: `<path template containing work-item key>`
- Stakeholder review: `<path template containing work-item key>`
- Release plan: `<path template containing work-item key>`
- ADR directory and naming: `<repository convention>`
- Onboarding log: `<optional support path; default docs/onboarding/<log-slug>.md>`

## Repository discovery

- Orientation documents: `<paths or discovery rule>`
- Project manifests: `<for example *.csproj, pyproject.toml, go.mod, Cargo.toml, package.json>`
- Source roots: `<paths>`
- Test roots: `<paths>`
- Infrastructure roots: `<paths>`
- Generated or forbidden paths: `<paths>`

## Verification

- Targeted test discovery: `<rule or command>`
- Unit suite: `<command>`
- Integration/contract suite: `<command and prerequisites>`
- Static analysis: `<command>`
- Build: `<command>`
- Coverage: `<command or not used>`

## Tool adapters

| Capability | Provider / adapter | Required inputs | Read or write | Approval | Fallback |
|---|---|---|---|---|---|
| `work-item.read` | `<adapter>` | `<key>` | Read | None | User-provided artifact |
| `pull-request.write` | `<adapter>` | `<branch, title, body>` | Write | Explicit user authorization | Return Markdown |

## Workflow extensions

For each extension, record:

- Phase ID:
- Purpose:
- Owning skill:
- Classification: `Required` or `Optional`
- Predecessor:
- Successor:
- Inputs:
- Outputs and path:
- Human gate:
- Completion evidence:
- Stop conditions:
