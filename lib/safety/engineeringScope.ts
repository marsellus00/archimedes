import type {
  EngineeringRequestCategory,
  EngineeringRequestClassification,
  EngineeringScopeStatus,
} from "@/lib/ai/types";
import { getContextualEngineeringNotice } from "@/lib/safety/contextualNotices";

const ENGINEERING_SIGNALS = [
  "engineering",
  "engineer",
  "technical",
  "design",
  "drawing",
  "calculation",
  "calculate",
  "load",
  "stress",
  "pressure",
  "flow",
  "fluid",
  "fluid dynamics",
  "fluid mechanics",
  "hydraulic",
  "hydraulics",
  "pipe",
  "pipeline",
  "pump",
  "motor",
  "electrical",
  "voltage",
  "current",
  "circuit",
  "structural",
  "civil",
  "mechanical",
  "process",
  "chemical",
  "construction",
  "maintenance",
  "inspection",
  "commissioning",
  "equipment",
  "safety",
  "hazard",
  "risk",
  "standard",
  "code",
  "specification",
  "rfi",
  "submittal",
  "method statement",
  "qa",
  "qc",
  "troubleshoot",
  "failure",
  "reliability",
  "tolerance",
  "capacity",
  "efficiency",
  "reynolds",
  "cavitation",
  "darcy",
  "weisbach",
  "darcy-weisbach",
  "head loss",
  "npsh",
  "pump head",
  "retaining wall",
  "finite element",
  "fea",
  "cfd",
  "simulation",
  "thermodynamics",
  "heat transfer",
  "mass flow",
  "thermal",
  "vibration",
  "corrosion",
  "material",
  "statics",
  "dynamics",
  "controls",
  "instrumentation",
  "manufacturing",
  "geotechnical",
  "foundation",
  "column",
  "strut",
  "beam",
  "slab",
  "truss",
  "buckling",
  "offshore",
  "marine",
  "naval architecture",
  "ship",
  "hull",
  "propeller",
  "riser",
  "risers",
  "bonjean",
  "simpson",
  "block coefficient",
  "navigational chart",
  "navigation chart",
  "chart datum",
  "ned coordinate",
  "north east down",
  "stability",
  "seakeeping",
  "hydrostatics",
  "fatigue",
];

const CONCEPT_SIGNALS = [
  "what is",
  "what are",
  "explain",
  "define",
  "meaning of",
  "difference between",
  "how does",
  "what does",
  "tell me about",
  "overview",
  "basics of",
];

const CALCULATION_SIGNALS = [
  "calculate",
  "calculation",
  "formula",
  "equation",
  "size",
  "sizing",
  "pressure drop",
  "flow rate",
  "reynolds",
  "voltage drop",
  "beam",
  "load",
  "stress",
  "capacity",
  "estimate",
  "determine",
  "compute",
  "simpson",
  "bonjean",
];

const DOCUMENTATION_SIGNALS = [
  "method statement",
  "procedure",
  "checklist",
  "report",
  "rfi",
  "submittal",
  "inspection record",
  "datasheet",
  "specification",
  "technical summary",
  "documentation",
];

const TROUBLESHOOTING_SIGNALS = [
  "troubleshoot",
  "fault",
  "failure",
  "alarm",
  "symptom",
  "diagnose",
  "root cause",
  "not working",
  "trip",
  "vibration",
  "overheating",
  "leak",
  "cavitation",
];

const STANDARDS_SIGNALS = [
  "standard",
  "code",
  "regulation",
  "jurisdiction",
  "authority having jurisdiction",
  "ahj",
  "compliance",
  "edition",
  "osha",
  "asme",
  "api",
  "iec",
  "ieee",
  "iso",
  "eurocode",
  "aci",
  "nfpa",
  "class society",
  "flag state",
  "dnv",
  "abs",
  "lloyd",
];

const SAFETY_CRITICAL_SIGNALS = [
  "structural integrity",
  "pressure vessel",
  "pressure system",
  "lifting",
  "crane",
  "rigging",
  "electrical safety",
  "energized",
  "hazardous",
  "confined space",
  "fire protection",
  "life safety",
  "machine guarding",
  "interlock",
  "bypass",
  "lockout",
  "tagout",
  "permit",
  "explosive",
  "toxic",
  "vessel stability",
  "navigation safety",
  "offshore operation",
];

const MARINE_OFFSHORE_SIGNALS = [
  "offshore",
  "marine",
  "naval architecture",
  "ship",
  "hull",
  "propeller",
  "riser",
  "risers",
  "bonjean",
  "block coefficient",
  "seakeeping",
  "hydrostatics",
  "vessel stability",
  "navigational chart",
  "navigation chart",
  "chart datum",
  "ned coordinate",
  "north east down",
];

const SIMULATION_SIGNALS = [
  "finite element",
  "fea",
  "cfd",
  "simulation",
  "mesh",
  "boundary condition",
  "load case",
  "model setup",
  "post-processing",
  "fatigue analysis",
  "optimization",
];

const OUT_OF_SCOPE_SIGNALS = [
  "celebrity",
  "movie",
  "music",
  "sports",
  "politics",
  "election",
  "dating",
  "relationship",
  "gossip",
  "horoscope",
  "recipe",
  "vacation",
  "fashion",
  "video game",
];

const APPROVAL_SIGNALS = /\b(final|approve|approval|certify|stamp|construction-ready|for construction|sign off|compliant|compliance certificate)\b/i;

export function classifyEngineeringRequest(message: string): EngineeringRequestClassification {
  const normalized = normalize(message);
  const detectedSignals: string[] = [];

  const hasEngineeringSignal = collectSignals(normalized, ENGINEERING_SIGNALS, detectedSignals);
  const hasConceptSignal = collectSignals(normalized, CONCEPT_SIGNALS, detectedSignals);
  const hasCalculationSignal = collectSignals(normalized, CALCULATION_SIGNALS, detectedSignals);
  const hasDocumentationSignal = collectSignals(normalized, DOCUMENTATION_SIGNALS, detectedSignals);
  const hasTroubleshootingSignal = collectSignals(normalized, TROUBLESHOOTING_SIGNALS, detectedSignals);
  const hasStandardsSignal = collectSignals(normalized, STANDARDS_SIGNALS, detectedSignals);
  const hasSafetyCriticalSignal = collectSignals(normalized, SAFETY_CRITICAL_SIGNALS, detectedSignals);
  const hasMarineOffshoreSignal = collectSignals(normalized, MARINE_OFFSHORE_SIGNALS, detectedSignals);
  const hasSimulationSignal = collectSignals(normalized, SIMULATION_SIGNALS, detectedSignals);
  const hasOutOfScopeSignal = collectSignals(normalized, OUT_OF_SCOPE_SIGNALS, detectedSignals);

  const scopeStatus: EngineeringScopeStatus =
    hasOutOfScopeSignal && !hasEngineeringSignal
      ? "out_of_scope"
      : hasEngineeringSignal
        ? "engineering"
        : "needs_clarification";

  const category = resolveCategory({
    scopeStatus,
    hasConceptSignal,
    hasCalculationSignal,
    hasDocumentationSignal,
    hasTroubleshootingSignal,
    hasStandardsSignal,
    hasSafetyCriticalSignal,
    hasMarineOffshoreSignal,
    hasSimulationSignal,
  });

  const requiresProfessionalReview =
    category === "safety_critical" ||
    hasSafetyCriticalSignal ||
    hasStandardsSignal ||
    APPROVAL_SIGNALS.test(message);

  return {
    category,
    scopeStatus,
    requiresProfessionalReview,
    detectedSignals: Array.from(new Set(detectedSignals)),
    safetyNotice: getContextualEngineeringNotice(category, requiresProfessionalReview),
  };
}

function resolveCategory(input: {
  scopeStatus: EngineeringScopeStatus;
  hasConceptSignal: boolean;
  hasCalculationSignal: boolean;
  hasDocumentationSignal: boolean;
  hasTroubleshootingSignal: boolean;
  hasStandardsSignal: boolean;
  hasSafetyCriticalSignal: boolean;
  hasMarineOffshoreSignal: boolean;
  hasSimulationSignal: boolean;
}): EngineeringRequestCategory {
  if (input.scopeStatus === "out_of_scope") return "out_of_scope";
  if (input.scopeStatus === "needs_clarification") return "ambiguous";
  if (input.hasSafetyCriticalSignal) return "safety_critical";
  if (input.hasStandardsSignal) return "standards_or_code";
  if (input.hasSimulationSignal) return "simulation_or_fea";
  if (input.hasMarineOffshoreSignal) return "marine_offshore_naval_architecture";
  if (input.hasCalculationSignal && !input.hasConceptSignal) return "engineering_calculation";
  if (input.hasTroubleshootingSignal && !input.hasConceptSignal) return "engineering_troubleshooting";
  if (input.hasDocumentationSignal) return "engineering_documentation";
  if (input.hasConceptSignal) return "engineering_concept";
  return "engineering_allowed";
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function collectSignals(normalizedMessage: string, signals: string[], detectedSignals: string[]): boolean {
  const matchedSignals = signals.filter((signal) => normalizedMessage.includes(signal));
  if (matchedSignals.length > 0) {
    detectedSignals.push(...matchedSignals);
    return true;
  }
  return false;
}
