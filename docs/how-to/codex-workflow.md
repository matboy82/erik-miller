# Use the SDD toolkit with Codex

Skills live in `.agents/skills`, with native name/description frontmatter and supporting references. Invoke `$skill-name` or select it through `/skills`. Codex scans this directory from your working directory to the repository root; restart if discovery has not refreshed. See [official skill documentation](https://learn.chatgpt.com/docs/build-skills) and [Claude migration guidance](https://developers.openai.com/plugins/guides/submit-claude-plugin).

Read `AGENTS.md` and `.agents/sdd-project.md`, then choose the phase matching the artifacts you have:

| Input | Skill | Gate |
|---|---|---|
| Brief | `$sdd-epic` | Approve epic |
| Approved epic + human story keys | `$sdd-stories` | Approve stories |
| Approved stories | `$sdd-qa-plan` | Approve QA/test seams |
| Approved stories + QA | `$sdd-tech-spec` | Approve spec/packages/ADRs |
| Approved contract + named packages | `$sdd-implement` | Implementation evidence |
| Approved contract + diff | `$sdd-review` | Review verdicts + human acceptance |
| Reviewed story | `$sdd-release` | Release plan; deploy separately authorized |

Optional discovery, diagnosis, cost checks, onboarding, stakeholder review, and manual gauntlet retain their boundaries. Drafts stay Draft until exact approval, with resolved questions. Local `MR-...` keys are human assigned; PRD workstream labels do not mint story keys.

## Conversion

All 17 workflows are converted; `claude-repo-hardening` becomes `codex-repo-hardening`. All 12 former agents become role skills with original names and no Claude tools/model fields. Shared references point to `.agents`; invocations use `$skill-name`. Codex rules are explicitly linked from `AGENTS.md`. Claude MCP/settings permissions were not imported.

Roles supplement the full phase procedures and operate in the current session. Use `$explorer` for read-only discovery or `$tech-lead` for planning. Role instructions are not enforced tool permissions. Independent adversarial review requires a fresh session with approved artifacts, repository instructions, raw diff, changed files, and verification output, excluding the implementation conversation. The owning review workflow records returned findings in the story-keyed review artifact.

No fanout, automatic launchers, hooks, or SDK runtime are introduced. Original `.claude` sources remain; future updates require deliberate porting. Run `npm run skills:validate` after edits. The [original Claude guide](team-ai-tooling.md) is historical toolkit guidance; its absent maintenance scripts are not product verification commands.
