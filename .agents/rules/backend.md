# Backend Rule

- Follow existing backend project architecture and naming before adding new patterns.
- Keep controllers, handlers, endpoints, and resolvers thin; move business behavior into the established service/application layer.
- Use dependency injection instead of static state.
- Preserve existing async, cancellation, transaction, and error-handling patterns.
- Prefer targeted tests around changed behavior.
- Do not copy secrets into code, docs, logs, or fixtures.
- Keep DTO/request validation and API contracts explicit.
- Update Swagger/OpenAPI, generated clients, or equivalent API docs when API behavior changes.
- Preserve existing unknown-field, error-envelope, and correlation-ID behavior unless the approved spec changes it.
