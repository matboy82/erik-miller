# Testing Rule

- Read and apply `../skills/_shared/tdd-practices.md` for test seams, red-to-green cycles, test doubles, and sensitivity.
- Map tests to acceptance criteria and QA plan scenarios.
- Keep tests deterministic, isolated, and repeatable.
- Use the test framework and infrastructure already present in the target repo.
- Do not introduce Testcontainers, Docker, browser, database, or external-service dependencies unless the repo's `CLAUDE.md`, CI, and approved QA plan allow them.
- Run the smallest useful verification command first, then broaden when risk requires it.
- Report skipped tests and known gaps explicitly.
- Keep coverage thresholds in mind when the repo defines them.
- For API changes, test validation/error behavior and update contract assertions where useful.
- For persistence changes, prefer integration coverage only when a local/disposable database is approved.
