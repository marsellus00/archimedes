# Engineering GPT

Engineering GPT is a controlled engineering assistant prototype for technical project work. It combines a Base.txt-governed AI assistant, deterministic engineering calculators, and database-backed traceability.

## Current capabilities

Implemented in this package:

- PostgreSQL schema using Prisma 7.
- Project, user, organization, membership, chat, calculation, uploaded-file, document-chunk, standards-reference, settings, and audit-log tables.
- Project-scoped access checks for real project data.
- User-scoped free chat sessions that do not require a project.
- Audit logging for key actions.
- Persisted chat sessions and messages for both free chats and project chats.
- Persisted calculation results with assumptions, warnings, limitations, review status, and professional-review flags.
- `/api/projects`, `/api/dashboard`, `/api/history`, and `/api/audit`.
- Assistant, calculator, and dashboard UI touchpoints wired to the active APIs.
- Collapsible right-side chat-history panel on the assistant page.

Full password/session authentication, MFA, and secure account-management pages are intentionally left for the selected authentication provider. The current app consumes trusted user context and local development headers so database integration can be validated before that provider is selected.

## Requirements

- Node.js compatible with Next.js 16.
- PostgreSQL.
- pgvector extension if document embeddings will be used.
- A configured AI provider only if live AI is required. Mock mode remains available for development review.

## Setup

```bash
npm install
# create .env and edit DATABASE_URL plus AI provider variables as needed
npm run db:generate
npm run db:deploy
npm run dev
```

For development, `ENABLE_LOCAL_DEV_USER=true` lets the app auto-provision a local engineering user. The assistant page defaults to free chat and no longer creates or requires a default project for simple engineering Q&A. In production, connect a real authentication provider or trusted gateway and configure `ENABLE_TRUSTED_AUTH_HEADERS=true` only behind a secure boundary.

> Note: the handoff archive does not include a regenerated package lock. Run `npm install` in your development environment to regenerate `package-lock.json`.

## Useful commands

```bash
npm run dev          # start local dev server
npm run build        # build production app
npm run db:generate  # generate Prisma client
npm run db:deploy    # apply migrations in production/staging
npm run db:migrate   # create/apply dev migrations
npm run db:studio    # open Prisma Studio
```

## Environment variables

Important database and runtime values:

```bash
DATABASE_URL=postgresql://engineering_gpt:engineering_gpt@localhost:5432/engineering_gpt?schema=public
REQUIRE_DATABASE=false
ENABLE_LOCAL_DEV_USER=true
ENABLE_TRUSTED_AUTH_HEADERS=false
AI_PROVIDER=mock
AI_LIVE_ENABLED=false
AI_MODEL=
```

Production should set `REQUIRE_DATABASE=true`, `ENABLE_LOCAL_DEV_USER=false`, configure trusted authenticated headers only behind a secure boundary, and store all real secrets in the host secret manager rather than committing them to the repository.

## API overview

- `/api/chat`: Base.txt-governed engineering assistant with database-backed free chat history by default; project chat is used only when `projectId` is supplied.
- `/api/calculations`: calculator catalog and database status.
- `/api/calculations/*`: deterministic calculation endpoints with optional persistence.
- `/api/projects`: project list/create.
- `/api/dashboard`: project-scoped live dashboard counts.
- `/api/history`: user-scoped free chat history by default; project-scoped chat/calculation/audit history when `projectId` is supplied.
- `/api/audit`: user-scoped free chat audit by default; project-scoped audit log when `projectId` is supplied.

## Engineering safety boundary

The assistant provides engineering support, education, drafting, preliminary calculations, and structured technical review. It does not approve, stamp, certify, or replace qualified professional engineering judgment. Safety-critical, regulated, final-design, construction, operational, or compliance work must be reviewed by the appropriate qualified professional and applicable authority.

## Usability updates

- Calculator numeric fields select their current value on focus, so typing into a default `0` replaces it instead of appending values such as `05`.
- The `/assistant` page restores the active free chat after navigation and displays recent free chat history from `/api/history`.
- The assistant chat history is displayed in a collapsible right panel on desktop and a drawer on smaller screens.

Free chat remains user-scoped and project-independent. Project chat still requires a real `projectId` and membership.
