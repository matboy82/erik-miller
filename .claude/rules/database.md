# Database Rule

- Prefer additive, backward-compatible changes.
- Document rollback and data integrity checks.
- Do not run migrations or deployment scripts against shared or production databases unless explicitly approved.
- Use the migration tooling and schema ownership model already established in the target repo.
- Never rely on destructive schema sync or auto-migration outside a throwaway local database.
- Treat destructive changes as a human approval gate.
- Preserve the repo's existing env-var resolution order and configuration precedence.
- Keep migrations additive and backward-compatible unless the destructive change is explicitly approved.
