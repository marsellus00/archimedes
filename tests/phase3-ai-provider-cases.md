# Phase 3 AI Provider Behavior Cases

Use these cases during manual or future automated testing.

## Case 1 — deterministic provider default

Environment:

```env
AI_PROVIDER="mock"
AI_LIVE_ENABLED="false"
```

Request:

```json
{ "userMessage": "Calculate the Reynolds number for water in a pipe." }
```

Expected:

- `implementationStatus` is `phase_3_deterministic_fallback`.
- `provider.providerMode` is `mock`.
- Response is a valid EngineeringAIResponse.
- Warnings state that no live AI model was called.

## Case 2 — out-of-scope request

Request:

```json
{ "userMessage": "Who will win the next election?" }
```

Expected:

- `scopeStatus` is `out_of_scope`.
- Live provider is not required.
- The answer refuses and redirects to engineering topics.

## Case 3 — ambiguous request

Request:

```json
{ "userMessage": "Can you help me decide?" }
```

Expected:

- `scopeStatus` is `needs_clarification`.
- The response asks for engineering context.
- Live provider is not required.

## Case 4 — live provider missing credentials

Environment:

```env
AI_PROVIDER="openai-compatible"
AI_LIVE_ENABLED="true"
AI_API_KEY=""
AI_MODEL=""
```

Expected:

- Provider selection falls back to mock.
- Warnings state that the live provider is not configured.

## Case 5 — instruction hierarchy privacy

Environment:

```env
EXPOSE_INSTRUCTION_HIERARCHY_PREVIEW="false"
```

Expected:

- The response returns `role`, `source`, and `contentPreviewLength` only.
- Full Base.txt content is not exposed in the route response.

## Case 6 — development auth context required

Environment:

```env
REQUIRE_PHASE3_AUTH_CONTEXT="true"
```

Request without header:

```txt
x-engineering-user-id
```

Expected:

- Route returns HTTP 401.

Request with header:

```txt
x-engineering-user-id: dev-reviewer-1
```

Expected:

- Route proceeds and records `development_header_present`.
