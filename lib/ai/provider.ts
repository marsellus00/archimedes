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

 try {
 const result = await provider.generateEngineeringResponse(input);

 return {
 ...result,
 warnings: [...selectionWarnings, ...result.warnings],
 };
 } catch (error) {
 const fallbackProvider = createMockEngineeringProvider({ liveEnabled: provider.info.liveEnabled });
 const fallbackResult = await fallbackProvider.generateEngineeringResponse(input);
 const errorMessage = summarizeProviderError(error);

 return {
 ...fallbackResult,
 provider: {
 ...fallbackResult.provider,
 providerName: `${fallbackResult.provider.providerName} after live provider failure`,
 liveEnabled: provider.info.liveEnabled,
 },
 warnings: [
 ...selectionWarnings,
 errorMessage,
 ...fallbackResult.warnings,
 ],
 };
 }
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

function summarizeProviderError(error: unknown): string {
 const raw = error instanceof Error ? error.message : String(error);
 const normalized = raw.toLowerCase();

 if (normalized.includes("rate limit") || normalized.includes("rate_limit")) {
 return "Live AI provider hit a rate limit, so deterministic fallback answered this request. Retry later or adjust the configured model/quota.";
 }

 if (normalized.includes("timeout") || normalized.includes("abort")) {
 return "Live AI provider timed out, so deterministic fallback answered this request. Retry later or increase AI_TIMEOUT_MS.";
 }

 if (normalized.includes("401") || normalized.includes("unauthorized")) {
 return "Live AI provider authentication failed, so deterministic fallback answered this request. Check AI_API_KEY.";
 }

 if (normalized.includes("429")) {
 return "Live AI provider returned HTTP 429, so deterministic fallback answered this request. Retry later or adjust provider quota/rate limits.";
 }

 return `Live AI provider failed, so deterministic fallback answered this request: ${raw.slice(0, 180)}`;
}

function normalizeProviderMode(value?: string) {
 if (value === "openai-compatible" || value === "mock") {
 return value;
 }

 return "mock";
}
