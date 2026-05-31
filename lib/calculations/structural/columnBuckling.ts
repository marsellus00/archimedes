import type { CalculationOutcome, CalculationResult, ValidationIssue } from "@/lib/calculations/common/resultTypes";
import { formatNumber, requirePositiveNumber, round } from "@/lib/calculations/common/validation";

export type ColumnBucklingInput = {
  length_m: number;
  effectiveLengthFactor: number;
  elasticModulus_GPa: number;
  momentOfInertia_cm4: number;
  area_cm2: number;
  appliedLoad_kN: number;
  objective?: string;
};

export type ColumnBucklingResult = CalculationResult & {
  calculationType: "column_buckling";
  results: CalculationResult["results"] & {
    criticalLoad_kN: { label: string; value: number; unit: "kN"; precision: number };
    slendernessRatio: { label: string; value: number; precision: number };
    factorOfSafety: { label: string; value: number; precision: number };
  };
};

export function calculateColumnBuckling(
  input: ColumnBucklingInput,
): CalculationOutcome<ColumnBucklingResult> {
  const issues: ValidationIssue[] = [
    ...requirePositiveNumber(input.length_m, "length_m", "Unsupported column length"),
    ...requirePositiveNumber(input.effectiveLengthFactor, "effectiveLengthFactor", "Effective length factor"),
    ...requirePositiveNumber(input.elasticModulus_GPa, "elasticModulus_GPa", "Elastic modulus"),
    ...requirePositiveNumber(input.momentOfInertia_cm4, "momentOfInertia_cm4", "Least-axis moment of inertia"),
    ...requirePositiveNumber(input.area_cm2, "area_cm2", "Cross-sectional area"),
    ...requirePositiveNumber(input.appliedLoad_kN, "appliedLoad_kN", "Applied axial load"),
  ];

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const elasticModulus_Pa = input.elasticModulus_GPa * 1e9;
  const momentOfInertia_m4 = input.momentOfInertia_cm4 * 1e-8;
  const area_m2 = input.area_cm2 * 1e-4;
  const effectiveLength_m = input.effectiveLengthFactor * input.length_m;
  const criticalLoad_N = (Math.PI ** 2 * elasticModulus_Pa * momentOfInertia_m4) / effectiveLength_m ** 2;
  const criticalLoad_kN = criticalLoad_N / 1000;
  const radiusOfGyration_m = Math.sqrt(momentOfInertia_m4 / area_m2);
  const slendernessRatio = effectiveLength_m / radiusOfGyration_m;
  const factorOfSafety = criticalLoad_kN / input.appliedLoad_kN;

  const result: ColumnBucklingResult = {
    calculationType: "column_buckling",
    objective:
      input.objective ??
      "Estimate Euler elastic buckling critical load and screening factor of safety for a slender compression member.",
    confidenceLevel: "preliminary",
    inputs: {
      length_m: { label: "Unsupported length", value: input.length_m, unit: "m", source: "user" },
      effectiveLengthFactor: { label: "Effective length factor K", value: input.effectiveLengthFactor, source: "user" },
      elasticModulus_GPa: { label: "Elastic modulus", value: input.elasticModulus_GPa, unit: "GPa", source: "user" },
      momentOfInertia_cm4: { label: "Least-axis moment of inertia", value: input.momentOfInertia_cm4, unit: "cm⁴", source: "user" },
      area_cm2: { label: "Cross-sectional area", value: input.area_cm2, unit: "cm²", source: "user" },
      appliedLoad_kN: { label: "Applied axial load", value: input.appliedLoad_kN, unit: "kN", source: "user" },
    },
    assumptions: [
      "Column behavior is approximated as elastic Euler buckling about the least-stiff axis.",
      "Load is concentric axial compression with no eccentricity, lateral loads, residual stress, imperfections, or connection flexibility included.",
      "Material remains elastic up to buckling load.",
    ],
    missingData: [
      "Section shape, end restraints, bracing layout, material grade, yield strength, imperfections, load combinations, and applicable structural code.",
    ],
    formulas: [
      { label: "Effective length", formula: "L_e = K L" },
      { label: "Euler critical load", formula: "P_cr = π² E I / (K L)²" },
      { label: "Radius of gyration", formula: "r = √(I/A)" },
      { label: "Slenderness", formula: "λ = K L / r" },
      { label: "Buckling safety factor", formula: "FS = P_cr / P_applied" },
    ],
    steps: [
      { label: "Effective length", expression: `L_e = ${input.effectiveLengthFactor} × ${input.length_m}`, result: `${formatNumber(effectiveLength_m, 3)} m` },
      { label: "Euler load", expression: `P_cr = π² × ${input.elasticModulus_GPa} GPa × ${input.momentOfInertia_cm4} cm⁴ / ${formatNumber(effectiveLength_m, 3)}²`, result: `${formatNumber(criticalLoad_kN, 3)} kN` },
      { label: "Slenderness", expression: `λ = ${formatNumber(effectiveLength_m, 3)} / √(${input.momentOfInertia_cm4} cm⁴ / ${input.area_cm2} cm²)`, result: `${formatNumber(slendernessRatio, 2)}` },
      { label: "Safety factor", expression: `FS = ${formatNumber(criticalLoad_kN, 3)} / ${input.appliedLoad_kN}`, result: `${formatNumber(factorOfSafety, 3)}` },
    ],
    results: {
      criticalLoad_kN: { label: "Euler critical load", value: round(criticalLoad_kN, 3), unit: "kN", precision: 3 },
      slendernessRatio: { label: "Slenderness ratio", value: round(slendernessRatio, 2), precision: 2 },
      factorOfSafety: { label: "Buckling FS", value: round(factorOfSafety, 3), precision: 3 },
    },
    warnings: [
      ...(factorOfSafety < 2 ? ["Buckling factor of safety is below 2.0; check code requirements and redesign/review as needed."] : []),
      "Structural capacity checks are safety-critical and require qualified engineering review before use.",
    ],
    limitations: [
      "This module does not perform code-based column design, local buckling, yielding, combined axial/bending interaction, connection design, or load-combination checks.",
      "Do not use this output as final design approval or structural certification.",
    ],
    requiresProfessionalReview: true,
    generatedAt: new Date().toISOString(),
  };

  return { ok: true, result };
}
