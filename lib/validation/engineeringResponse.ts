import type { EngineeringAIResponse } from "@/lib/ai/types";
import { validateEngineeringAIResponse } from "@/lib/ai/responseContract";
import { enforceEngineeringResponseBoundaries } from "@/lib/safety/responseGuards";

export function normalizeEngineeringAIResponse(
 response: EngineeringAIResponse,
): EngineeringAIResponse {
 return enforceEngineeringResponseBoundaries({
 ...response,
 answer: response.answer.trim(),
 assumptions: uniqueStrings(response.assumptions),
 missingData: uniqueStrings(response.missingData),
 safetyWarnings: uniqueStrings(response.safetyWarnings),
 standardsReferenced: uniqueStrings(response.standardsReferenced),
 }).response;
}

export function assertValidEngineeringAIResponse(
 response: EngineeringAIResponse,
): EngineeringAIResponse {
 const normalized = normalizeEngineeringAIResponse(response);
 const issues = validateEngineeringAIResponse(normalized);

 if (issues.length > 0) {
 throw new Error(`Invalid engineering AI response: ${issues.join(", ")}`);
 }

 return normalized;
}

function uniqueStrings(values: string[]): string[] {
 return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
