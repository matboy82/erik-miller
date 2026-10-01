# Technology Convention Detection

Use this reference only after reading the target repo's manifests and nearby code. Prefer observed local patterns over these defaults.

## React / Vite / Next

- Detect scripts and package manager from `package.json` plus lockfile.
- Capture component, hook, route, state, API-client, styling, and test conventions.
- Rules usually need: component boundaries, accessibility, form validation, loading/error/empty states, API mocking strategy, browser/E2E availability, and generated client handling.
- Verification usually includes the narrow test command, typecheck/build, lint, and E2E only when the repo already supports it in CI.

## Angular

- Read `angular.json`, `nx.json` when present, `tsconfig*`, project layout, and test builder config.
- Capture module/standalone component pattern, services, interceptors, RxJS style, forms, routing, and Angular Material or design-system conventions.
- Rules usually need: template type safety, observable cleanup, guards/interceptors, DI patterns, accessibility, and test harness strategy.
- Verification usually includes affected project test, typecheck/build, lint, and E2E only when configured.

## NestJS / TypeScript

- Read `nest-cli.json`, `package.json`, modules, controllers, services, DTOs, filters, guards, interceptors, TypeORM/Prisma config, and test setup.
- Rules usually need: thin controllers, DI, DTO validation, error envelope, correlation IDs, Swagger/OpenAPI updates, provider boundaries, and module wiring.
- Do not assume Testcontainers. Codify whether tests use mocks, in-memory fakes, local databases, Docker compose, or Testcontainers.
- Verification usually includes targeted Jest tests, non-mutating lint/typecheck/build, and integration tests only with approved prerequisites.

## .NET

- Read `*.sln`, `*.csproj`, `global.json`, `Directory.Build.*`, launch settings, appsettings, test projects, EF migrations, and CI.
- Capture framework version, nullable context, analyzers, DI pattern, API style, logging, validation, auth, EF/Dapper usage, and test libraries.
- Rules usually need: nullable handling, async/cancellation, options/config binding, EF migrations, transaction boundaries, API contracts, ProblemDetails/error shape, and integration-test infrastructure.
- Verification usually includes targeted `dotnet test`, `dotnet build`, format/analyzer commands when configured, and integration tests only when CI supports the dependencies.

## Shared rule for every stack

Never write stack-specific Codex rules until the repo proves that stack is present. If multiple stacks are present, scope rules to directories or projects instead of making global claims.
