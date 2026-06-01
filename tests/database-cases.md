# Database-backed Database Test Cases

## Database readiness

- `GET /api/chat` returns `database_integrated` and database configuration status.
- `GET /api/calculations` returns `calculation_history_ready`.
- With no `DATABASE_URL` in development, chat and calculations continue without persistence and report a database-not-configured status.
- With no `DATABASE_URL` in production or `REQUIRE_DATABASE=true`, persisted endpoints fail safely with 503.

## Projects

- `GET /api/projects` creates or returns the local user's default project in development.
- `POST /api/projects` creates an organization, a project, an OWNER project membership, and an audit event.
- Project responses do not expose projects outside the authenticated user's memberships.

## Chat persistence

- `POST /api/chat` creates a chat session when no `sessionId` is provided.
- Subsequent `POST /api/chat` calls with the same `sessionId` append messages to that session.
- User message, assistant message, response metadata, provider metadata, and audit event are saved.
- Attempting to use a session from another project returns 404/403.

## Calculation persistence

- Each calculator endpoint persists valid results to `calculations` when the database is configured.
- Persisted rows include input JSON, full result JSON, assumptions, warnings, limitations, review status, user, and project.
- Safety-critical calculations are marked for review.
- Invalid calculation inputs still return validation errors and are not saved.

## Dashboard and history

- `GET /api/dashboard` returns live counts for calculations, chats, uploaded files, and professional-review flags.
- `GET /api/history` returns recent calculations, chat sessions, and audit events for the project.
- `GET /api/audit` returns project-scoped audit entries.
