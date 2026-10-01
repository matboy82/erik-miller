# SDD Artifact Identity

Use one human-assigned stable work-item key as the basename for every artifact scoped to that work item.

## Resolve identity

Read `.claude/sdd-project.md` as defined by the shared project-profile rules.

- Use the configured provider, metadata label, key validation, and filename normalization.
- When no profile exists, require a Jira-style key, label metadata `**Jira story**: PLAT-12345`, and normalize it to lowercase for filenames.
- When a profile permits tracker-free work, require a human-assigned local key and configured metadata label. Do not invent an ordinal or title slug.
- The normalized basename must be a single safe path segment. Reject absolute paths, `..`, separators, shell metacharacters, and an empty result.
- Preserve the canonical human-facing key in metadata even when its filename form is normalized.

## Apply identity

Use the same normalized key for story, developer spec, work packages, review, stakeholder review, and release plan paths resolved through the shared artifact contract.

The SDD review artifact is the single persistent record for code-review and required adversarial-review verdicts. Preserve both verdicts in that file. Use the stakeholder-review artifact only when persistence is explicitly requested.

If an approved input lacks the configured stable key, stop and request it before creating, renaming, reviewing, or releasing a story-specific artifact.
