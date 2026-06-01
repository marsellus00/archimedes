import type { EngineeringAIResponse } from "@/lib/ai/types";

const PROHIBITED_APPROVAL_PATTERNS = [
 /\bthis is approved\b/i,
 /\bapproved for construction\b/i,
 /\bapproved for operation\b/i,
 /\bthis is compliant\b/i,
 /\bcode compliant\b/i,
 /\bno engineer review is needed\b/i,
 /\bno professional review is needed\b/i,
 /\byou can safely install\b/i,
 /\bbypass (the )?(interlock|guard|safety|permit|inspection)\b/i,
 /\bignore (the )?(code|standard|inspection|permit|safety requirement)\b/i,
];

const SAFE_REPLACEMENTS: Array<[RegExp, string]> = [
 [/\bthis is approved\b/gi, "this is a preliminary engineering support response"],
 [/\bthis is compliant\b/gi, "this should be verified against the applicable code, project specification, and authority having jurisdiction"],
 [/\bcode compliant\b/gi, "subject to verification against the applicable code, project specification, and authority having jurisdiction"],
 [/\bno engineer review is needed\b/gi, "qualified professional review may be required before use"],
 [/\bno professional review is needed\b/gi, "qualified professional review may be required before use"],
 [/\byou can safely install\b/gi, "installation should only proceed after qualified review, inspection, and authorization"],
];

export type EngineeringResponseGuardResult = {
 response: EngineeringAIResponse;
 violations: string[];
};

export function enforceEngineeringResponseBoundaries(
 response: EngineeringAIResponse,
): EngineeringResponseGuardResult {
 const violations = PROHIBITED_APPROVAL_PATTERNS.filter((pattern) =>
 pattern.test(response.answer),
 ).map((pattern) => pattern.source);

 let safeAnswer = response.answer;
 for (const [pattern, replacement] of SAFE_REPLACEMENTS) {
 safeAnswer = safeAnswer.replace(pattern, replacement);
 }

 const safetyWarnings = [...response.safetyWarnings];

 if (violations.length > 0) {
 safetyWarnings.push(
 "Response wording was adjusted to avoid implying approval, compliance certification, unsafe bypassing, or replacement of qualified professional review.",
 );
 }

 if (response.requiresProfessionalReview && safetyWarnings.length === 0) {
 safetyWarnings.push(
 "Verify this response with the responsible qualified professional before use in safety-critical, regulated, final design, construction, or operational work.",
 );
 }

 return {
 response: {
 ...response,
 answer: safeAnswer,
 safetyWarnings: Array.from(new Set(safetyWarnings)),
 },
 violations,
 };
}
