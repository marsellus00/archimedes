# Phase 3 Review Checkpoint — AI API Integration

## Objective

Attach an AI-provider integration layer to the Phase 2 server-side instruction hierarchy and structured response contract without prematurely implementing database persistence, production authentication, document retrieval, or deterministic calculation tools.

## Implemented in this checkpoint

- Added `lib/ai/provider.ts` for provider selection and provider abstraction.
- Added `lib/ai/providers/mockProvider.ts` for deterministic review-safe fallback behavior.
- Added `lib/ai/providers/openAICompatibleProvider.ts` for OpenAI-compatible chat-completions APIs using server-side `fetch`.
- Extended `lib/ai/types.ts` with provider metadata, usage metadata, request context, and Phase 3 envelope types.
- Upgraded `app/api/chat/route.ts` from a Phase 2 contract-preview endpoint to a Phase 3 provider-ready endpoint.
- Added optional server-sent-events response mode using `stream: true` in the request body.
- Preserved the Phase 2 engineering scope gate so out-of-scope or ambiguous requests do not need live model calls.
- Added Phase 3 environment variables to `.env.example`.
- Added AI provider setup documentation and Phase 3 manual behavior tests.

## Current route behavior

`GET /api/chat` returns provider status and the safe-boundary summary.

`POST /api/chat` accepts:

```json
{
  "userMessage": "Calculate whether a 50 mm water pipe at 3 m/s is turbulent.",
  "projectContext": {
    "projectId": "demo-project",
    "discipline": "mechanical"
  },
  "documentContexts": [],
  "stream": false
}
```

The route then:

1. Parses the request.
2. Builds a Phase 3 request context.
3. Classifies engineering scope.
4. Builds the Base.txt instruction hierarchy.
5. Short-circuits out-of-scope or ambiguous requests safely.
6. Selects the configured provider.
7. Generates a structured `EngineeringAIResponse`.
8. Validates the response contract.
9. Runs professional-boundary wording guards.
10. Returns a response envelope with provider metadata, classification, warnings, and safe-boundary notes.

## Live provider activation

The route remains deterministic by default. To test a live OpenAI-compatible provider locally:

```env
AI_PROVIDER="openai-compatible"
AI_LIVE_ENABLED="true"
AI_API_KEY="..."
AI_MODEL="..."
AI_BASE_URL="https://api.openai.com/v1"
```

The provider expects a JSON object matching the EngineeringAIResponse contract. Responses that do not parse or validate are rejected.

## Safe review boundary

This checkpoint intentionally does **not** implement:

- Production authentication or role-based authorization.
- Database reads or writes.
- Chat history persistence.
- Project permission checks backed by a database.
- File upload, parsing, embeddings, or document retrieval.
- Calculation tool-calling or deterministic calculation APIs.
- Audit logging.

## Development authentication context

Production authentication belongs to a later phase. For local route review, the route records whether an `x-engineering-user-id` header is present. Set `REQUIRE_PHASE3_AUTH_CONTEXT=true` to require that header during Phase 3 review.

## Reviewer checks

1. Confirm `AI_PROVIDER=mock` returns a deterministic Phase 3 envelope without credentials.
2. Confirm out-of-scope requests are refused before live AI generation.
3. Confirm ambiguous requests ask for engineering context before live AI generation.
4. Confirm `EXPOSE_INSTRUCTION_HIERARCHY_PREVIEW=false` hides prompt content.
5. Confirm live provider mode is impossible without `AI_API_KEY` and `AI_MODEL`.
6. Confirm model responses must conform to the structured response contract.
7. Confirm the route clearly reports that database and production auth are deferred.

## Recommended next step

Proceed to Phase 4 after review: integrate deterministic calculation modules and tool-calling boundaries so the AI explains calculations while trusted calculation code computes them.
