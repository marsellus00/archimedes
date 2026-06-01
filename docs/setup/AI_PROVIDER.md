# AI Provider Setup

## Review-safe default

No credentials are required for the default AI provider integration review mode:

```env
AI_PROVIDER="mock"
AI_LIVE_ENABLED="false"
```

This mode verifies route wiring, Base.txt loading, engineering scope classification, response validation, and envelope shape.

## Live OpenAI-compatible provider

Use this configuration only in a local or controlled development environment:

```env
AI_PROVIDER="openai-compatible"
AI_LIVE_ENABLED="true"
AI_API_KEY="your-api-key"
AI_MODEL="your-model-name"
AI_BASE_URL="https://api.openai.com/v1"
AI_TIMEOUT_MS="30000"
AI_TEMPERATURE="0.2"
AI_RESPONSE_FORMAT_JSON="true"
```

For Azure, proxy, or enterprise-compatible gateways, set `AI_BASE_URL` to the gateway URL that exposes a chat-completions-compatible endpoint.

## Development auth context

Production authentication is not implemented in AI provider integration. To require a simulated user context while reviewing the route:

```env
REQUIRE_AUTH_CONTEXT="true"
```

Then send this header:

```txt
x-engineering-user-id: dev-reviewer-1
```

## Example request

```bash
curl -X POST http://localhost:3000/api/chat \
 -H 'Content-Type: application/json' \
 -H 'x-engineering-user-id: dev-reviewer-1' \
 -d '{
 "userMessage":"Calculate if a 50 mm water pipe at 3 m/s is turbulent.",
 "projectContext":{"projectId":"demo","discipline":"mechanical"}
 }'
```

## Example streaming request

```bash
curl -N -X POST http://localhost:3000/api/chat \
 -H 'Content-Type: application/json' \
 -d '{
 "userMessage":"Prepare a pump troubleshooting checklist for high vibration.",
 "stream":true
 }'
```
