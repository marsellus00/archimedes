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

 const broadConceptResponse = tryResolveBroadConceptResponse(input);
 if (broadConceptResponse) {
 return broadConceptResponse;
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

function tryResolveBroadConceptResponse(
 input: EngineeringAIProviderInput,
) {
 const normalized = input.promptInput.userMessage.toLowerCase();
 const base = createDefaultEngineeringAIResponse(input.classification);

 if (input.classification.scopeStatus !== "engineering") {
 return undefined;
 }

 if (normalized.includes("gnss") || normalized.includes("gps")) {
 return {
 ...base,
 answer: [
 "GNSS means Global Navigation Satellite System. In general, it is a satellite-based positioning, navigation, and timing system that lets a receiver estimate its location, speed, and time by processing signals from navigation satellites.",
 "In engineering, GNSS is used for surveying, ship tracking, offshore positioning, drones, autonomous vehicles, construction machine control, asset tracking, timing synchronization, and navigation systems.",
 "For ship tracking, GNSS position is commonly combined with AIS, ECDIS/chartplotters, speed over ground, course over ground, antenna placement checks, redundancy, and safe-navigation procedures.",
 ].join("\n\n"),
 assumptions: [
 "The question is treated as a broad engineering/navigation concept because no specific application area was supplied.",
 ],
 missingData: [],
 safetyWarnings: [],
 requiresProfessionalReview: false,
 confidenceLevel: "not_applicable" as const,
 };
 }

 if (normalized.includes("hydrocarbon")) {
 return {
 ...base,
 answer: [
 "A hydrocarbon is a chemical compound made mainly of hydrogen and carbon atoms. Simple examples include methane, ethane, propane, and butane; larger mixtures appear in natural gas, crude oil, gasoline-range fractions, diesel-range fractions, waxes, and condensates.",
 "In engineering, hydrocarbons matter in petroleum production, process design, combustion, fuels, petrochemicals, environmental engineering, storage, transport, fire safety, and emissions control.",
 "For petroleum engineering, the focus is usually reservoir fluids, oil/gas/condensate behavior, phase changes, gas-oil ratio, API gravity, production, separation, processing, and safe handling.",
 ].join("\n\n"),
 assumptions: [
 "The question is treated as a broad engineering/science concept because no specific application area was supplied.",
 ],
 missingData: [],
 safetyWarnings: [],
 requiresProfessionalReview: false,
 confidenceLevel: "not_applicable" as const,
 };
 }

 if (normalized.includes("isaac newton") || /\bnewton\b/.test(normalized)) {
 const isContemporaryQuestion =
 normalized.includes("contemporary") ||
 (normalized.includes("bernoulli") && normalized.includes("newton"));

 if (!isContemporaryQuestion) {
 return {
 ...base,
 answer: [
 "Isaac Newton was an English mathematician and physicist whose work became a foundation for classical mechanics, calculus, optics, and engineering analysis.",
 "In engineering, Newton is especially important because Newton's laws of motion are used in statics, dynamics, vibration, machine design, vehicle motion, structural loading, fluid mechanics, and control systems. The SI unit of force, the newton (N), is named after him.",
 "A simple engineering link is F = m a: force equals mass times acceleration. This relationship is central to many load, motion, and dynamics calculations.",
 ].join("\n\n"),
 assumptions: [
 "The question is treated as a foundational engineering/science education question.",
 ],
 missingData: [],
 safetyWarnings: [],
 requiresProfessionalReview: false,
 confidenceLevel: "not_applicable" as const,
 };
 }
 }

 if (normalized.includes("johann bernoulli") && normalized.includes("newton")) {
 return {
 ...base,
 answer: [
 "Yes. Johann Bernoulli and Isaac Newton were contemporaries.",
 "Johann Bernoulli lived from 1667 to 1748, while Isaac Newton lived from 1642 to 1727, so their lifetimes overlapped for about 60 years. They were active during the same broad period of early calculus, mechanics, and mathematical physics.",
 "In engineering history, this matters because Newtonian mechanics and Bernoulli-family mathematics both became foundations for later mechanics, fluid flow, structural analysis, dynamics, and applied mathematics.",
 ].join("\n\n"),
 assumptions: [
 "The question is treated as an engineering-adjacent history-of-mathematics and mechanics question.",
 ],
 missingData: [],
 safetyWarnings: [],
 requiresProfessionalReview: false,
 confidenceLevel: "not_applicable" as const,
 };
 }

 if (normalized.includes("bernoulli")) {
 const asksPerson =
 normalized.includes("who is") ||
 normalized.includes("who was") ||
 normalized.includes("johann") ||
 normalized.includes("daniel");

 if (asksPerson) {
 return {
 ...base,
 answer: [
 "Bernoulli usually refers to members of the Bernoulli family, a major family of mathematicians whose work strongly influenced engineering mathematics, mechanics, and fluid flow.",
 "In engineering, the name is most often connected with Daniel Bernoulli and Bernoulli's principle/equation in fluid mechanics. Johann Bernoulli, Daniel's father, was also an important mathematician known for work in calculus and mechanics.",
 "For fluid mechanics, Bernoulli's equation relates pressure, velocity, elevation, and energy along a streamline under idealized assumptions.",
 ].join("\n\n"),
 assumptions: [
 "The question is interpreted as an engineering-adjacent concept/history question rather than unrelated biography.",
 ],
 missingData: [],
 safetyWarnings: [],
 requiresProfessionalReview: false,
 confidenceLevel: "not_applicable" as const,
 };
 }

 return {
 ...base,
 answer: [
 "In engineering, Bernoulli usually refers to Daniel Bernoulli and Bernoulli's principle/equation in fluid mechanics. The principle relates pressure, fluid speed, elevation, and energy along a streamline for ideal flow.",
 "A common simplified form is p + 1/2 rho v^2 + rho g z = constant, where p is pressure, rho is fluid density, v is velocity, g is gravitational acceleration, and z is elevation.",
 "It is used to understand pipe flow, nozzles, pumps, venturi meters, aircraft lift explanations, ship and propeller flow, and many hydraulic systems. Real systems also need losses, viscosity, turbulence, pumps, fittings, and measurement uncertainty considered.",
 ].join("\n\n"),
 assumptions: [
 "The question is interpreted in the engineering-fluid-mechanics sense of Bernoulli rather than as an unrelated biography request.",
 ],
 missingData: [],
 safetyWarnings: [],
 requiresProfessionalReview: false,
 confidenceLevel: "not_applicable" as const,
 };
 }

 if (normalized.includes("corrosion")) {
 return {
 ...base,
 answer: [
 "Corrosion is the degradation of a material, usually a metal, due to chemical or electrochemical reaction with its environment.",
 "In engineering, it affects pipelines, ships, offshore structures, reinforced concrete, process equipment, storage tanks, electrical grounding, fasteners, and structural steel. Common controls include material selection, coatings, cathodic protection, corrosion allowance, chemical inhibition, drainage/detailing, and inspection programs.",
 ].join("\n\n"),
 assumptions: [
 "The question is treated as a general materials/reliability engineering concept.",
 ],
 missingData: [],
 safetyWarnings: [],
 requiresProfessionalReview: false,
 confidenceLevel: "not_applicable" as const,
 };
 }

 return undefined;
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
