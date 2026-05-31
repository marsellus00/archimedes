# Engineering GPT

Engineering GPT is a controlled engineering assistant prototype for technical project work. It combines a Base.txt-governed AI assistant, deterministic engineering calculators, and Phase 5 database-backed traceability.

## Current phase

**Phase 5.1 — Database Integration with Free Chat Sessions**

Implemented in this package:

- PostgreSQL schema using Prisma 7.
- Project, user, organization, membership, chat, calculation, uploaded-file, document-chunk, standards-reference, settings, and audit-log tables.
- Project-scoped access checks for real project data.
- User-scoped free chat sessions that do not require a Project.
- Audit logging for key actions.
- Persisted chat sessions and messages for both free chats and project chats.
- Persisted calculation results with assumptions, warnings, limitations, review status, and professional-review flags.
- `/api/projects`, `/api/dashboard`, `/api/history`, and `/api/audit`.
- Assistant, calculator, and dashboard UI touchpoints wired to the Phase 5 APIs.

Full password/session authentication, MFA, and secure account-management pages are intentionally reserved for **Phase 6**. Phase 5 consumes trusted user context and local development headers so database integration can be validated before the auth provider is selected.

## Requirements

- Node.js compatible with Next.js 16.
- PostgreSQL.
- pgvector extension if document embeddings will be used.
- A configured AI provider only if live AI is required. Mock mode remains available for development review.

## Setup

```bash
npm install
cp .env.example .env
# edit DATABASE_URL and AI provider variables
npm run db:generate
npm run db:deploy
npm run dev
```

For development, `ENABLE_LOCAL_DEV_USER=true` lets the app auto-provision a local engineering user. The assistant page defaults to free chat and no longer creates or requires a default project for simple engineering Q&A. In production, set up Phase 6 authentication or a trusted gateway and configure `ENABLE_TRUSTED_AUTH_HEADERS=true` only behind a secure boundary.

> Note: the handoff archive does not include a regenerated package lock because registry access timed out in the build environment after adding Prisma dependencies. Run `npm install` in your development environment to regenerate `package-lock.json`.

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

See `.env.example` for local/development defaults and `.env.production.example` for deployment defaults. Both templates are safe to commit because they contain placeholders only.

Important Phase 5 values:

```bash
DATABASE_URL=postgresql://engineering_gpt:engineering_gpt@localhost:5432/engineering_gpt?schema=public
REQUIRE_PHASE5_DATABASE=false          # set true in production
ENABLE_LOCAL_DEV_USER=true             # local only
ENABLE_TRUSTED_AUTH_HEADERS=false      # true only behind a trusted gateway
AI_PROVIDER=mock                       # use openai-compatible for live AI
AI_LIVE_ENABLED=false
AI_MODEL=                              # required when AI_PROVIDER=openai-compatible
```

Production should set `REQUIRE_PHASE5_DATABASE=true`, `ENABLE_LOCAL_DEV_USER=false`, configure trusted authenticated headers only behind a secure boundary, and store all real secrets in the host secret manager rather than committing them to the repository.

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

## Phase 5.2 usability patch

This package includes the Phase 5 free-chat rework plus two local-testing fixes:

- Calculator numeric fields now select their current value on focus, so typing into a default `0` replaces it instead of appending values such as `05`.
- The `/assistant` page now restores the active free chat after navigation and displays recent free chat history from `/api/history`.

Free chat remains user-scoped and project-independent. Project chat still requires a real `projectId` and membership.
