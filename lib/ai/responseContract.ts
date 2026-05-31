import type {
  EngineeringAIResponse,
  EngineeringConfidenceLevel,
  EngineeringRequestClassification,
  EngineeringScopeStatus,
} from "@/lib/ai/types";
import { enforceEngineeringResponseBoundaries } from "@/lib/safety/responseGuards";

export function createDefaultEngineeringAIResponse(
  classification: EngineeringRequestClassification,
): EngineeringAIResponse {
  const response: EngineeringAIResponse = {
    answer: resolveDefaultAnswer(classification),
    scopeStatus: classification.scopeStatus,
    assumptions: [],
    missingData:
      classification.scopeStatus === "needs_clarification"
        ? ["Engineering context is required before a substantive response can be provided."]
        : [],
    safetyWarnings: shouldIncludeDefaultSafetyNotice(classification)
      ? [classification.safetyNotice]
      : [],
    standardsReferenced: [],
    requiresProfessionalReview: classification.requiresProfessionalReview,
    confidenceLevel: resolveConfidenceLevel(classification.scopeStatus),
  };

  return enforceEngineeringResponseBoundaries(response).response;
}

export function createOutOfScopeResponse(): EngineeringAIResponse {
  return {
    answer:
      "I’m designed to help with engineering and technical project work, so I can’t assist with that topic. I can help with engineering calculations, design checks, maintenance troubleshooting, safety reviews, documentation, standards interpretation, or related technical workflows.",
    scopeStatus: "out_of_scope",
    assumptions: [],
    missingData: [],
    safetyWarnings: [
      "Request declined because it does not include a clear engineering, construction, maintenance, safety, equipment, calculation, standards, or technical workflow context.",
    ],
    standardsReferenced: [],
    requiresProfessionalReview: false,
    confidenceLevel: "not_applicable",
  };
}

export function createNeedsClarificationResponse(
  classification: EngineeringRequestClassification,
): EngineeringAIResponse {
  return {
    answer:
      "Please provide the engineering system, equipment, project, calculation, drawing, standard, safety issue, or technical workflow this relates to, and I’ll help within that context.",
    scopeStatus: "needs_clarification",
    assumptions: [],
    missingData: [
      "Engineering discipline or technical context.",
      "Relevant system, equipment, drawing, document, calculation, or safety context.",
    ],
    safetyWarnings: [classification.safetyNotice],
    standardsReferenced: [],
    requiresProfessionalReview: classification.requiresProfessionalReview,
    confidenceLevel: "not_applicable",
  };
}

export function validateEngineeringAIResponse(
  response: EngineeringAIResponse,
): string[] {
  const issues: string[] = [];

  if (!response.answer.trim()) {
    issues.push("answer is required");
  }

  if (!isValidScopeStatus(response.scopeStatus)) {
    issues.push("scopeStatus is invalid");
  }

  if (!isValidConfidenceLevel(response.confidenceLevel)) {
    issues.push("confidenceLevel is invalid");
  }

  if (!Array.isArray(response.assumptions)) {
    issues.push("assumptions must be an array");
  }

  if (!Array.isArray(response.missingData)) {
    issues.push("missingData must be an array");
  }

  if (!Array.isArray(response.safetyWarnings)) {
    issues.push("safetyWarnings must be an array");
  }

  if (!Array.isArray(response.standardsReferenced)) {
    issues.push("standardsReferenced must be an array");
  }

  return issues;
}

function resolveDefaultAnswer(
  classification: EngineeringRequestClassification,
): string {
  if (classification.scopeStatus === "out_of_scope") {
    return createOutOfScopeResponse().answer;
  }

  if (classification.scopeStatus === "needs_clarification") {
    return createNeedsClarificationResponse(classification).answer;
  }

  if (classification.category === "engineering_concept") {
    return [
      "This engineering concept request passed the scope gate.",
      "A live model can answer it directly without requiring project context unless the user asks for design, sizing, approval, or field application.",
    ].join(" ");
  }

  if (classification.category === "marine_offshore_naval_architecture") {
    return [
      "This marine, offshore, or naval-architecture request passed the engineering scope gate.",
      "A live model can answer concept questions directly and should use calculation/safety boundaries for design-critical or regulated work.",
    ].join(" ");
  }

  if (classification.category === "simulation_or_fea") {
    return [
      "This simulation or FEA request passed the engineering scope gate.",
      "A live model should explain workflow, required inputs, assumptions, validation checks, mesh sensitivity, and limitations.",
    ].join(" ");
  }

  return [
    "Phase 4 engineering support path is active and the request appears to fit the engineering-assistant scope.",
    "The AI provider supplies explanation and documentation while deterministic calculation modules compute implemented engineering calculations.",
  ].join(" ");
}

function shouldIncludeDefaultSafetyNotice(
  classification: EngineeringRequestClassification,
): boolean {
  return (
    classification.scopeStatus !== "engineering" ||
    classification.requiresProfessionalReview ||
    classification.category === "engineering_calculation" ||
    classification.category === "engineering_documentation" ||
    classification.category === "engineering_troubleshooting" ||
    classification.category === "standards_or_code" ||
    classification.category === "simulation_or_fea" ||
    classification.category === "marine_offshore_naval_architecture" ||
    classification.category === "safety_critical"
  );
}

function resolveConfidenceLevel(
  scopeStatus: EngineeringScopeStatus,
): EngineeringConfidenceLevel {
  return scopeStatus === "engineering" ? "preliminary" : "not_applicable";
}

function isValidScopeStatus(value: string): value is EngineeringScopeStatus {
  return ["engineering", "out_of_scope", "needs_clarification"].includes(value);
}

function isValidConfidenceLevel(value: string): value is EngineeringConfidenceLevel {
  return ["rough_estimate", "preliminary", "detailed", "not_applicable"].includes(
    value,
  );
}
