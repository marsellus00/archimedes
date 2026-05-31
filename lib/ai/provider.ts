import type {
  AIProviderInfo,
  EngineeringAIProvider,
  EngineeringAIProviderInput,
  EngineeringAIProviderResult,
} from "@/lib/ai/types";
import { createMockEngineeringProvider } from "@/lib/ai/providers/mockProvider";
import { createOpenAICompatibleProvider } from "@/lib/ai/providers/openAICompatibleProvider";

export type ProviderSelection = {
  provider: EngineeringAIProvider;
  selectionWarnings: string[];
};

export function getConfiguredAIProvider(): ProviderSelection {
  const liveEnabled = process.env.AI_LIVE_ENABLED === "true";
  const providerMode = normalizeProviderMode(process.env.AI_PROVIDER);

  if (!liveEnabled || providerMode === "mock") {
    return {
      provider: createMockEngineeringProvider({ liveEnabled }),
      selectionWarnings: liveEnabled
        ? [
            "AI_LIVE_ENABLED=true, but AI_PROVIDER=mock. Deterministic fallback provider was selected intentionally.",
          ]
        : [
            "Live AI is disabled. Set AI_LIVE_ENABLED=true, configure AI_PROVIDER, AI_API_KEY, and AI_MODEL to enable a live provider.",
          ],
    };
  }

  if (providerMode === "openai-compatible") {
    const provider = createOpenAICompatibleProvider();

    if (!provider.info.configured) {
      return {
        provider: createMockEngineeringProvider({ liveEnabled }),
        selectionWarnings: [
          "OpenAI-compatible provider was requested but is not fully configured. Falling back to deterministic provider.",
          "Required values: AI_API_KEY and AI_MODEL. Optional value: AI_BASE_URL.",
        ],
      };
    }

    return {
      provider,
      selectionWarnings: [],
    };
  }

  return {
    provider: createMockEngineeringProvider({ liveEnabled }),
    selectionWarnings: [
      `Unsupported AI_PROVIDER value '${process.env.AI_PROVIDER}'. Falling back to deterministic provider.`,
    ],
  };
}

export async function generateEngineeringResponseWithProvider(
  input: EngineeringAIProviderInput,
): Promise<EngineeringAIProviderResult> {
  const { provider, selectionWarnings } = getConfiguredAIProvider();
  const result = await provider.generateEngineeringResponse(input);

  return {
    ...result,
    warnings: [...selectionWarnings, ...result.warnings],
  };
}

export function buildProviderInfoOverride(
  info: AIProviderInfo,
  overrides: Partial<AIProviderInfo>,
): AIProviderInfo {
  return {
    ...info,
    ...overrides,
  };
}

function normalizeProviderMode(value?: string) {
  if (value === "openai-compatible" || value === "mock") {
    return value;
  }

  return "mock";
}
