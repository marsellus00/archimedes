import type { CalculationOutcome, CalculationResult, ValidationIssue } from "@/lib/calculations/common/resultTypes";
import { formatNumber, optionalNonNegativeNumber, requireNonNegativeNumber, requirePositiveNumber, round } from "@/lib/calculations/common/validation";

export type RetainingWallInput = {
  wallHeight_m: number;
  soilUnitWeight_kN_m3: number;
  frictionAngle_deg: number;
  surcharge_kPa: number;
  baseWidth_m: number;
  wallWeight_kN_per_m: number;
  baseFrictionCoefficient: number;
  objective?: string;
};

export type RetainingWallResult = CalculationResult & {
  calculationType: "retaining_wall_stability";
  results: CalculationResult["results"] & {
    activePressureCoefficient: { label: string; value: number; precision: number };
    activeForce_kN_per_m: { label: string; value: number; unit: "kN/m"; precision: number };
    factorOfSafetySliding: { label: string; value: number; precision: number };
    factorOfSafetyOverturning: { label: string; value: number; precision: number };
  };
};

export function calculateRetainingWallStability(
  input: RetainingWallInput,
): CalculationOutcome<RetainingWallResult> {
  const issues: ValidationIssue[] = [
    ...requirePositiveNumber(input.wallHeight_m, "wallHeight_m", "Retained height"),
    ...requirePositiveNumber(input.soilUnitWeight_kN_m3, "soilUnitWeight_kN_m3", "Soil unit weight"),
    ...requirePositiveNumber(input.baseWidth_m, "baseWidth_m", "Base width"),
    ...requirePositiveNumber(input.wallWeight_kN_per_m, "wallWeight_kN_per_m", "Wall self-weight"),
    ...requirePositiveNumber(input.baseFrictionCoefficient, "baseFrictionCoefficient", "Base friction coefficient"),
    ...requireNonNegativeNumber(input.frictionAngle_deg, "frictionAngle_deg", "Soil friction angle"),
    ...optionalNonNegativeNumber(input.surcharge_kPa, "surcharge_kPa", "Uniform surcharge"),
  ];

  if (input.frictionAngle_deg >= 45) {
    issues.push({ field: "frictionAngle_deg", message: "Soil friction angle should be below 45° for this simplified Rankine active-pressure module." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const surcharge_kPa = input.surcharge_kPa ?? 0;
  const phiRad = (input.frictionAngle_deg * Math.PI) / 180;
  const activePressureCoefficient = (1 - Math.sin(phiRad)) / (1 + Math.sin(phiRad));
  const activeFromSoil_kN_per_m =
    0.5 * activePressureCoefficient * input.soilUnitWeight_kN_m3 * input.wallHeight_m ** 2;
  const activeFromSurcharge_kN_per_m =
    activePressureCoefficient * surcharge_kPa * input.wallHeight_m;
  const activeForce_kN_per_m = activeFromSoil_kN_per_m + activeFromSurcharge_kN_per_m;
  const overturningMoment_kNm_per_m =
    activeFromSoil_kN_per_m * (input.wallHeight_m / 3) +
    activeFromSurcharge_kN_per_m * (input.wallHeight_m / 2);
  const resistingMoment_kNm_per_m = input.wallWeight_kN_per_m * (input.baseWidth_m / 2);
  const slidingResistance_kN_per_m = input.baseFrictionCoefficient * input.wallWeight_kN_per_m;
  const factorOfSafetySliding = slidingResistance_kN_per_m / activeForce_kN_per_m;
  const factorOfSafetyOverturning = resistingMoment_kNm_per_m / overturningMoment_kNm_per_m;

  const result: RetainingWallResult = {
    calculationType: "retaining_wall_stability",
    objective:
      input.objective ??
      "Perform a preliminary gravity-retaining-wall screening check for active earth pressure, sliding, and overturning.",
    confidenceLevel: "rough_estimate",
    inputs: {
      wallHeight_m: { label: "Retained height", value: input.wallHeight_m, unit: "m", source: "user" },
      soilUnitWeight_kN_m3: { label: "Soil unit weight", value: input.soilUnitWeight_kN_m3, unit: "kN/m³", source: "user" },
      frictionAngle_deg: { label: "Soil friction angle", value: input.frictionAngle_deg, unit: "deg", source: "user" },
      surcharge_kPa: { label: "Uniform surcharge", value: surcharge_kPa, unit: "kPa", source: "user" },
      baseWidth_m: { label: "Base width", value: input.baseWidth_m, unit: "m", source: "user" },
      wallWeight_kN_per_m: { label: "Wall self-weight", value: input.wallWeight_kN_per_m, unit: "kN/m", source: "user" },
      baseFrictionCoefficient: { label: "Base friction coefficient", value: input.baseFrictionCoefficient, source: "user" },
    },
    assumptions: [
      "Rankine active earth pressure is used with level backfill and drained granular soil behavior.",
      "Wall is treated as a simplified gravity wall for screening only.",
      "Wall weight acts at mid-base for the resisting moment estimate.",
      "Passive resistance, key action, water pressure, seismic loads, bearing capacity, and eccentricity are not included.",
    ],
    missingData: [
      "Backfill slope, groundwater level, drainage details, soil parameters from geotechnical report, bearing capacity, wall geometry, load combinations, and applicable design standard.",
    ],
    formulas: [
      { label: "Rankine active coefficient", formula: "K_a = (1 - sinφ) / (1 + sinφ)" },
      { label: "Active soil thrust", formula: "P_soil = 0.5 K_a γ H²" },
      { label: "Surcharge thrust", formula: "P_q = K_a q H" },
      { label: "Sliding safety factor", formula: "FS_sliding = μW / P_a" },
      { label: "Overturning safety factor", formula: "FS_OT = M_resisting / M_overturning" },
    ],
    steps: [
      { label: "Active coefficient", expression: `K_a = (1 - sin${input.frictionAngle_deg}°) / (1 + sin${input.frictionAngle_deg}°)`, result: `${formatNumber(activePressureCoefficient, 4)}` },
      { label: "Active thrust", expression: `P_a = 0.5×${formatNumber(activePressureCoefficient, 4)}×${input.soilUnitWeight_kN_m3}×${input.wallHeight_m}² + ${formatNumber(activePressureCoefficient, 4)}×${surcharge_kPa}×${input.wallHeight_m}`, result: `${formatNumber(activeForce_kN_per_m, 3)} kN/m` },
      { label: "Sliding FS", expression: `FS = (${input.baseFrictionCoefficient}×${input.wallWeight_kN_per_m}) / ${formatNumber(activeForce_kN_per_m, 3)}`, result: `${formatNumber(factorOfSafetySliding, 3)}` },
      { label: "Overturning FS", expression: `FS = ${formatNumber(resistingMoment_kNm_per_m, 3)} / ${formatNumber(overturningMoment_kNm_per_m, 3)}`, result: `${formatNumber(factorOfSafetyOverturning, 3)}` },
    ],
    results: {
      activePressureCoefficient: { label: "Active pressure coefficient", value: round(activePressureCoefficient, 4), precision: 4 },
      activeForce_kN_per_m: { label: "Active lateral force", value: round(activeForce_kN_per_m, 3), unit: "kN/m", precision: 3 },
      factorOfSafetySliding: { label: "Sliding FS", value: round(factorOfSafetySliding, 3), precision: 3 },
      factorOfSafetyOverturning: { label: "Overturning FS", value: round(factorOfSafetyOverturning, 3), precision: 3 },
    },
    warnings: [
      ...(factorOfSafetySliding < 1.5 ? ["Sliding factor of safety is below a common preliminary target of 1.5; redesign or detailed review is required."] : []),
      ...(factorOfSafetyOverturning < 2 ? ["Overturning factor of safety is below a common preliminary target of 2.0; redesign or detailed review is required."] : []),
      "Retaining walls are safety-critical civil/structural elements and require qualified engineering and geotechnical review.",
    ],
    limitations: [
      "This is not a complete retaining-wall design. It does not check bearing pressure, eccentricity, settlement, reinforcement, drainage, global stability, seismic loading, water pressure, or code load combinations.",
      "Do not use this output as construction approval, design certification, or code compliance confirmation.",
    ],
    requiresProfessionalReview: true,
    generatedAt: new Date().toISOString(),
  };

  return { ok: true, result };
}
