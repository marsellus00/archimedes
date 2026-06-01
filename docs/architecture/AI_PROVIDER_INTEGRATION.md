# AI Provider Integration

## Design principle

The AI provider is not allowed to replace the engineering safety contract. The provider receives the Base.txt instruction hierarchy and must return a structured response. The application validates and guards that response before returning it.

## Provider abstraction

The provider interface is defined in `lib/ai/types.ts`:

```ts
export type EngineeringAIProvider = {
 info: AIProviderInfo;
 generateEngineeringResponse(input: EngineeringAIProviderInput): Promise<EngineeringAIProviderResult>;
 streamEngineeringResponse?(input: EngineeringAIProviderInput): AsyncIterable<string>;
};
```

`lib/ai/provider.ts` selects either:

- `mock`: deterministic AI provider integration fallback provider.
- `openai-compatible`: live chat-completions provider.

## Default mode

The default mode is deterministic:

```env
AI_PROVIDER="mock"
AI_LIVE_ENABLED="false"
```

This lets reviewers test route behavior without an external API key.

## OpenAI-compatible mode

Set:

```env
AI_PROVIDER="openai-compatible"
AI_LIVE_ENABLED="true"
AI_API_KEY="..."
AI_MODEL="..."
AI_BASE_URL="https://api.openai.com/v1"
```

The provider calls:

```txt
POST {AI_BASE_URL}/chat/completions
```

It sends the Base.txt instruction hierarchy and a final system instruction requiring JSON-only output matching the EngineeringAIResponse shape.

## Validation and safety boundary

The application validates:

- `answer`
- `scopeStatus`
- `assumptions`
- `missingData`
- `safetyWarnings`
- `standardsReferenced`
- `requiresProfessionalReview`
- `confidenceLevel`

The application also runs wording guards to avoid approval, compliance-certification, unsafe bypassing, or replacement-of-review language.

## Streaming status

The route supports server-sent-events transport when request body includes:

```json
{ "stream": true }
```

At this checkpoint the streaming wrapper emits metadata, answer chunks, and the final envelope. True provider token streaming can be added after the provider contract is accepted.
