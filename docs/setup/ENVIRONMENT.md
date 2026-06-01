# Environment Configuration

Use `.env.example` as the template for `.env.local` during local development.

The AI provider integration checkpoint does not require live AI, database, object-storage, or production authentication credentials. The default `AI_PROVIDER=mock` and `AI_LIVE_ENABLED=false` settings are intentionally review-safe.

## Categories

- Application identity and environment.
- AI provider settings.
- AI provider integration development authentication context.
- Database connection.
- Authentication/session settings.
- Object storage for uploaded files.
- Vector storage for document retrieval.
- Safety and audit behavior flags.

## Security guidance

- Never commit `.env.local`, production secrets, API keys, database passwords, or object-storage credentials.
- Rotate secrets if they are exposed in logs, screenshots, issue trackers, or archives.
- Keep browser-exposed values prefixed with `NEXT_PUBLIC_` only when they are safe for public visibility.
- Server-side AI, database, and authentication secrets must never be exposed to client components.

## AI provider integration AI provider flags

- `AI_PROVIDER`: `mock` or `openai-compatible`.
- `AI_LIVE_ENABLED`: must be `true` before the live provider is selected.
- `AI_API_KEY`: server-side API key for the live provider.
- `AI_MODEL`: model name used by the live provider.
- `AI_BASE_URL`: base URL for an OpenAI-compatible `/chat/completions` endpoint.
- `AI_TIMEOUT_MS`: provider request timeout.
- `AI_TEMPERATURE`: generation temperature, clamped between 0 and 1.
- `AI_RESPONSE_FORMAT_JSON`: requests JSON-object output when the provider supports it.

## AI provider integration development auth context

- `REQUIRE_AUTH_CONTEXT`: when `true`, `/api/chat` requires the `x-engineering-user-id` header. This is not production authentication; it is a review-time guard until the authentication layer.

## Instruction hierarchy preview flag

- `EXPOSE_INSTRUCTION_HIERARCHY_PREVIEW`: should remain `false` outside local review. When false, `/api/chat` returns only role/source/length metadata for the instruction hierarchy.
