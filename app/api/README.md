# API Routes

## Phase 5 status

The API layer now includes database-backed engineering traceability.

| Route | Status | Purpose |
|---|---|---|
| `/api/chat` | Phase 5 | Engineering assistant route with Base.txt, scope guards, provider abstraction, persisted chat sessions/messages, and audit metadata |
| `/api/calculations` | Phase 5 | Catalog of deterministic calculators with database status |
| `/api/calculations/*` | Phase 5 | Deterministic calculation modules with optional calculation-history persistence |
| `/api/projects` | Phase 5 | List and create project records |
| `/api/dashboard` | Phase 5 | Project-scoped live dashboard summary |
| `/api/history` | Phase 5 | Project-scoped chat, calculation, and audit history |
| `/api/audit` | Phase 5 | Project-scoped audit log |

## Authentication boundary

Phase 5 expects trusted authenticated user context. In development, local headers or the default local user can be used. Phase 6 should replace this bridge with a mature auth provider.

## Database boundary

Set `DATABASE_URL` and run the Prisma migration before using Phase 5 in production.
