# Database-backed Review — Database Integration

Database-backed converts the prototype from mostly stateless API responses into a database-backed engineering workspace. It introduces a production PostgreSQL model for traceability while keeping full account authentication as the next roadmap item.

## What changed

- Added Prisma 7 with PostgreSQL adapter support.
- Added a normalized project data model:
 - users
 - organizations
 - projects
 - project members
 - chat sessions
 - chat messages
 - calculations
 - uploaded files
 - document chunks
 - audit logs
 - engineering standard references
 - user settings
- Added project membership and role-based permission checks.
- Added audit logging for project creation, chat responses, and calculations.
- Persisted chat sessions/messages from `/api/chat` when `DATABASE_URL` is configured.
- Persisted deterministic calculation results from calculator endpoints when `DATABASE_URL` is configured.
- Added `/api/projects`, `/api/dashboard`, `/api/history`, and `/api/audit`.
- Updated assistant, calculator, and dashboard UI touchpoints for Database-backed persistence.

## Production boundary

Database-backed intentionally does not implement password/session security from scratch. The app now consumes a trusted authenticated context and enforces database access around it. the authentication layer should integrate a mature authentication provider and replace the trusted-header development bridge.

## Database setup

1. Provision PostgreSQL.
2. Install pgvector if document embeddings will be used.
3. Set `DATABASE_URL`.
4. Run:

```bash
npm install
npm run db:generate
npm run db:deploy
npm run build
```

## Access-control model

Project data access is enforced through `ProjectMember` roles.

| Role | Key permissions |
|---|---|
| Owner | Full access including delete |
| Admin | Manage project, upload, chat, calculate, review |
| Engineer | Upload, chat, calculate, view |
| Reviewer | Review, chat, calculate, view |
| Viewer | View only |

## Audit trail

The audit log captures project creation, default project creation, chat response generation, and calculation execution. Audit rows are separate from primary entities and should not be editable by normal users.

## Remaining roadmap items

- the authentication layer: mature authentication and authorization UI.
- Document retrieval: file upload, storage, extraction, chunking, embeddings, and document-grounded retrieval.
- future: deeper frontend replacement of mock analytics/widgets with live project data.
