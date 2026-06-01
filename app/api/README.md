# API Routes

## Current status

| Route | Status | Purpose |
| --- | --- | --- |
| `/api/chat` | Active | Engineering assistant route with Base.txt, scope guards, provider abstraction, persisted chat sessions/messages, and audit metadata |
| `/api/calculations` | Active | Catalog of deterministic calculators with database status |
| `/api/calculations/*` | Active | Deterministic calculation modules with optional calculation-history persistence |
| `/api/projects` | Active | List and create project records |
| `/api/dashboard` | Active | Project-scoped live dashboard summary |
| `/api/history` | Active | Project-scoped chat, calculation, and audit history |
| `/api/audit` | Active | Project-scoped audit log |

## Authentication boundary

The API expects trusted authenticated user context. In development, local headers or the default local user can be used. Production deployments should replace this bridge with a mature authentication provider and only enable trusted headers behind a secure gateway.

## Database boundary

Set `DATABASE_URL` and run the Prisma migration before using database-backed routes in production.
