import type {
  AIProviderInfo,
  AIProviderUsage,
  EngineeringAIProvider,
  EngineeringAIProviderInput,
  EngineeringAIProviderResult,
  EngineeringAIResponse,
  EngineeringInstructionMessage,
} from "@/lib/ai/types";
import { assertValidEngineeringAIResponse } from "@/lib/validation/engineeringResponse";

const DEFAULT_OPENAI_COMPATIBLE_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_TIMEOUT_MS = 30000;

type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export function createOpenAICompatibleProvider(): EngineeringAIProvider {
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();
  const baseUrl = normalizeBaseUrl(process.env.AI_BASE_URL);
  const configured = Boolean(apiKey && model);

  const info: AIProviderInfo = {
    providerName: "OpenAI-compatible chat-completions provider",
    providerMode: "openai-compatible",
    runtimeMode: configured ? "live_openai_compatible" : "live_disabled",
    model: model || undefined,
    baseUrl,
    liveEnabled: process.env.AI_LIVE_ENABLED === "true",
    configured,
  };

  return {
    info,
    async generateEngineeringResponse(
      input: EngineeringAIProviderInput,
    ): Promise<EngineeringAIProviderResult> {
      if (!configured || !apiKey || !model) {
        throw new Error(
          "OpenAI-compatible provider is not configured. Set AI_API_KEY and AI_MODEL.",
        );
      }

      const timeoutMs = resolveTimeoutMs();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: buildChatMessages(input),
            temperature: resolveTemperature(),
            ...(process.env.AI_RESPONSE_FORMAT_JSON === "true"
              ? { response_format: { type: "json_object" } }
              : {}),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `AI provider request failed with ${response.status}: ${errorText.slice(
              0,
              800,
            )}`,
          );
        }

        const payload = (await response.json()) as ChatCompletionResponse;
        const rawContent = payload.choices?.[0]?.message?.content;

        if (!rawContent) {
          throw new Error("AI provider response did not include message content.");
        }

        const parsedResponse = parseEngineeringAIResponse(rawContent);
        const validatedResponse = assertValidEngineeringAIResponse(parsedResponse);

        return {
          response: validatedResponse,
          provider: info,
          usage: mapUsage(payload.usage),
          warnings: [],
          generatedAt: new Date().toISOString(),
        };
      } finally {
        clearTimeout(timeout);
      }
    },
    async *streamEngineeringResponse(input: EngineeringAIProviderInput) {
      const result = await this.generateEngineeringResponse(input);
      yield result.response.answer;
    },
  };
}

function buildChatMessages(
  input: EngineeringAIProviderInput,
): ChatCompletionMessage[] {
  return [
    ...input.instructionHierarchy.map(toChatCompletionMessage),
    {
      role: "system",
      content: [
        "Return only a JSON object matching this exact TypeScript shape:",
        '{"answer":"string","scopeStatus":"engineering|out_of_scope|needs_clarification","assumptions":["string"],"missingData":["string"],"safetyWarnings":["string"],"standardsReferenced":["string"],"requiresProfessionalReview":true,"confidenceLevel":"rough_estimate|preliminary|detailed|not_applicable"}',
        "Do not wrap the JSON in markdown. Do not include extra top-level fields.",
        `Pre-classified request category: ${input.classification.category}.`,
        `Pre-classified scope status: ${input.classification.scopeStatus}.`,
        `Professional review required by classifier: ${input.classification.requiresProfessionalReview}.`,
      ].join("\n"),
    },
  ];
}

function toChatCompletionMessage(
  message: EngineeringInstructionMessage,
): ChatCompletionMessage {
  return {
    role: message.role === "developer" ? "system" : message.role,
    content: message.content,
  };
}

function parseEngineeringAIResponse(rawContent: string): EngineeringAIResponse {
  const candidate = extractJsonObject(rawContent);
  const parsed = JSON.parse(candidate) as Partial<EngineeringAIResponse>;

  return {
    answer: typeof parsed.answer === "string" ? parsed.answer : "",
    scopeStatus:
      parsed.scopeStatus === "out_of_scope" ||
      parsed.scopeStatus === "needs_clarification" ||
      parsed.scopeStatus === "engineering"
        ? parsed.scopeStatus
        : "needs_clarification",
    assumptions: toStringArray(parsed.assumptions),
    missingData: toStringArray(parsed.missingData),
    safetyWarnings: toStringArray(parsed.safetyWarnings),
    standardsReferenced: toStringArray(parsed.standardsReferenced),
    requiresProfessionalReview:
      typeof parsed.requiresProfessionalReview === "boolean"
        ? parsed.requiresProfessionalReview
        : true,
    confidenceLevel:
      parsed.confidenceLevel === "rough_estimate" ||
      parsed.confidenceLevel === "preliminary" ||
      parsed.confidenceLevel === "detailed" ||
      parsed.confidenceLevel === "not_applicable"
        ? parsed.confidenceLevel
        : "preliminary",
  };
}

function extractJsonObject(rawContent: string): string {
  const trimmed = rawContent.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error("AI provider response was not parseable as a JSON object.");
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeBaseUrl(value?: string): string {
  const baseUrl = value?.trim() || DEFAULT_OPENAI_COMPATIBLE_BASE_URL;
  return baseUrl.replace(/\/+$/, "");
}

function resolveTimeoutMs(): number {
  const parsed = Number(process.env.AI_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function resolveTemperature(): number {
  const parsed = Number(process.env.AI_TEMPERATURE);
  if (!Number.isFinite(parsed)) {
    return 0.2;
  }

  return Math.min(Math.max(parsed, 0), 1);
}

function mapUsage(usage: ChatCompletionResponse["usage"]): AIProviderUsage | undefined {
  if (!usage) {
    return undefined;
  }

  return {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
  };
}
