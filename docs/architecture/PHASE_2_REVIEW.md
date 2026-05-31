# Phase 2 Review Checkpoint

## Objective

Convert `Base.txt` from a static instruction document into enforceable server-side application logic without yet connecting a live AI provider, database, authentication provider, calculation API, or file retrieval pipeline.

## Implemented in this checkpoint

- Added `lib/ai/basePrompt.ts` to load and validate `Base.txt` server-side.
- Added a typed instruction hierarchy in `lib/ai/instructionHierarchy.ts`.
- Added a structured AI response contract in `lib/ai/types.ts` and `lib/ai/responseContract.ts`.
- Added engineering-scope classification in `lib/safety/engineeringScope.ts`.
- Added prompt-injection boundary handling for uploaded document context in `lib/safety/promptInjection.ts`.
- Added response wording guardrails in `lib/safety/responseGuards.ts`.
- Added contextual engineering notices in `lib/safety/contextualNotices.ts`.
- Added response normalization and validation helpers in `lib/validation/engineeringResponse.ts`.
- Replaced the placeholder `app/api/chat/.gitkeep` scaffold with a Phase 2 contract-only chat route.
- Added documentation for the AI instruction contract and prompt-injection boundary.
- Added Phase 2 behavior test cases for manual or future automated validation.
- Updated README and API documentation to reflect Phase 2 status.

## Safe review boundary

This checkpoint intentionally does **not** implement:

- Live AI API calls.
- Streaming model responses.
- Database persistence.
- Authentication or authorization.
- File upload, parsing, chunking, embeddings, or retrieval.
- Deterministic calculation APIs.
- Audit logging.

The `/api/chat` route is a contract-preview endpoint only. It classifies the request, builds the server-side instruction hierarchy, returns a structured response envelope, and proves that `Base.txt` is applied before later AI-provider integration. By default it exposes only role/source/length metadata for the hierarchy; truncated content is exposed only if `EXPOSE_INSTRUCTION_HIERARCHY_PREVIEW=true` for local review.

## Reviewer checks

1. Confirm that `Base.txt` is loaded server-side and validated for required sections.
2. Confirm that uploaded document context is explicitly treated as untrusted data.
3. Confirm that out-of-scope requests are refused with engineering redirection.
4. Confirm that ambiguous requests ask for engineering context.
5. Confirm that safety-critical, standards, final approval, and calculation categories produce review/verification notices.
6. Confirm that the response contract includes assumptions, missing data, safety warnings, standards references, professional-review status, and confidence level.
7. Confirm that no code path claims live production AI, database, authentication, retrieval, or calculation behavior.

## Recommended next step

Proceed to Phase 3 after review: attach a model-provider abstraction and server-side AI API integration to the Phase 2 prompt hierarchy and response contract.
