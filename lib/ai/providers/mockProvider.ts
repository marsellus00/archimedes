import {
 createDefaultEngineeringAIResponse,
 createNeedsClarificationResponse,
 createOutOfScopeResponse,
} from "@/lib/ai/responseContract";
import type {
 EngineeringAIProvider,
 EngineeringAIProviderInput,
 EngineeringAIProviderResult,
} from "@/lib/ai/types";
import { assertValidEngineeringAIResponse } from "@/lib/validation/engineeringResponse";

export function createMockEngineeringProvider(options?: {
 liveEnabled?: boolean;
}): EngineeringAIProvider {
 const info = {
 providerName: "Deterministic AI provider integration fallback provider",
 providerMode: "mock" as const,
 runtimeMode: "deterministic_mock" as const,
 liveEnabled: options?.liveEnabled ?? false,
 configured: true,
 };

 return {
 info,
 async generateEngineeringResponse(
 input: EngineeringAIProviderInput,
 ): Promise<EngineeringAIProviderResult> {
 const response = resolveFallbackResponse(input);

 return {
 response: assertValidEngineeringAIResponse(response),
 provider: info,
 warnings: [
 "Deterministic fallback response returned. No live AI model was called.",
 "This is suitable for route validation and UI integration, not final assistant behavior.",
 ],
 generatedAt: new Date().toISOString(),
 };
 },
 async *streamEngineeringResponse(input: EngineeringAIProviderInput) {
 const result = await this.generateEngineeringResponse(input);
 const chunks = chunkText(result.response.answer, 72);

 for (const chunk of chunks) {
 yield chunk;
 }
 },
 };
}

function resolveFallbackResponse(input: EngineeringAIProviderInput) {
 const { classification } = input;

 if (classification.scopeStatus === "out_of_scope") {
 return createOutOfScopeResponse();
 }

 if (classification.scopeStatus === "needs_clarification") {
 return createNeedsClarificationResponse(classification);
 }

 const response = createDefaultEngineeringAIResponse(classification);

 return {
 ...response,
 answer: [
 "AI provider path is active and the request passed the engineering-scope gate.",
 "A live model response was not generated because the deterministic fallback provider is selected.",
 "Configure AI_LIVE_ENABLED=true with an OpenAI-compatible provider to test live generation.",
 ].join(" "),
 safetyWarnings: [
 ...response.safetyWarnings,
 "Live AI output must still pass the engineering response validator and professional-boundary guard before being returned.",
 ],
 };
}

function chunkText(value: string, maxLength: number): string[] {
 const chunks: string[] = [];
 let remaining = value;

 while (remaining.length > maxLength) {
 const cutIndex = remaining.lastIndexOf(" ", maxLength);
 const safeIndex = cutIndex > 24 ? cutIndex : maxLength;
 chunks.push(remaining.slice(0, safeIndex));
 remaining = remaining.slice(safeIndex).trimStart();
 }

 if (remaining) {
 chunks.push(remaining);
 }

 return chunks;
}
