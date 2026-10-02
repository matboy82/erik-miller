# Use the SDD toolkit with Codex

Skills live in `.agents/skills`, with native name/description frontmatter and supporting references. Invoke `$skill-name` or select it through `/skills`. Codex scans this directory from your working directory to the repository root; restart if discovery has not refreshed. See [official skill documentation](https://learn.chatgpt.com/docs/build-skills) and [Claude migration guidance](https://developers.openai.com/plugins/guides/submit-claude-plugin).

Read `AGENTS.md` and `.agents/sdd-project.md`, then choose the phase matching the artifacts you have:

| Input | Skill | Gate |
|---|---|---|
| Brief | `$sdd-epic` | Approve epic |
| Approved epic + human story keys | `$sdd-stories` | Approve stories |
| Approved stories | `$sdd-qa-plan` | Approve QA/test seams |
| Approved stories + QA | `$sdd-tech-spec` | Approve spec/packages, any release spec, and ADRs |
| Approved contract + named packages | `$sdd-implement` | Development/test evidence; release-only checks remain deferred |
| Approved contract + diff | `$sdd-review` | Code-review verdicts + separate human story acceptance |
| Reviewed story | `$sdd-release` | Release plan/readiness; deploy separately authorized |

A story-keyed **release spec** is created during technical planning when some evidence can only be collected after development and testing. It names the local implementation/test exit and the exact live, owner, account, or production gates for later. Only an approved release spec can defer those named checks. It cannot defer missing implementation, local tests, manual checks, or quality bars that can run before rollout. A development/test pass is not story acceptance or release readiness. `$sdd-release` creates the later rollout plan after review; deployment and external actions still need your explicit authorization.

Optional discovery, diagnosis, cost checks, onboarding, stakeholder review, and manual gauntlet retain their boundaries. Drafts stay Draft until exact approval, with resolved questions. Local `MR-...` keys are human assigned; PRD workstream labels do not mint story keys.

## Conversion

All 17 workflows are converted; `claude-repo-hardening` becomes `codex-repo-hardening`. All 12 former agents become role skills with original names and no Claude tools/model fields. Shared references point to `.agents`; invocations use `$skill-name`. Codex rules are explicitly linked from `AGENTS.md`. Claude MCP/settings permissions were not imported.

Roles supplement the full phase procedures and operate in the current session. Use `$explorer` for read-only discovery or `$tech-lead` for planning. Role instructions are not enforced tool permissions. Independent adversarial review requires a fresh session with approved artifacts, repository instructions, raw diff, changed files, and verification output, excluding the implementation conversation. The owning review workflow records returned findings in the story-keyed review artifact.

No fanout, automatic launchers, hooks, or SDK runtime are introduced. Original `.claude` sources remain; future updates require deliberate porting. Run `npm run skills:validate` after edits. The [original Claude guide](team-ai-tooling.md) is historical toolkit guidance; its absent maintenance scripts are not product verification commands.
