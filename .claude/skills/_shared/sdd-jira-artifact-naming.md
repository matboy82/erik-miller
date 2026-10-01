# Jira Artifact-Naming Compatibility

This reference is retained for downstream copies that still link to its old path. New and updated workflows must read [the provider-neutral artifact identity rules](sdd-artifact-identity.md) directly.

When `.claude/sdd-project.md` does not configure another provider, the provider-neutral rules preserve the existing Jira behavior:

- require a human-assigned Jira story key;
- record `**Jira story**: PLAT-12345` near status metadata;
- normalize the key to lowercase for filenames;
- use the default story, spec, work-package, review, stakeholder-review, and release paths from [the shared artifact contract](sdd-artifact-contracts.md);
- stop rather than invent a missing key or fall back to a generic filename.

Do not add new callers to this compatibility reference.
