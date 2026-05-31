import type { CalculationOutcome, CalculationResult, ValidationIssue } from "@/lib/calculations/common/resultTypes";
import { formatNumber, requirePositiveNumber, round } from "@/lib/calculations/common/validation";

export type ThermalConductionInput = {
  area_m2: number;
  thickness_m: number;
  thermalConductivity_W_mK: number;
  hotSideTemp_C: number;
  coldSideTemp_C: number;
  objective?: string;
};

export type ThermalConductionResult = CalculationResult & {
  calculationType: "thermal_conduction";
  results: CalculationResult["results"] & {
    temperatureDifference_K: { label: string; value: number; unit: "K"; precision: number };
    heatTransferRate_W: { label: string; value: number; unit: "W"; precision: number };
    heatFlux_W_m2: { label: string; value: number; unit: "W/m²"; precision: number };
  };
};

export function calculateThermalConduction(
  input: ThermalConductionInput,
): CalculationOutcome<ThermalConductionResult> {
  const issues: ValidationIssue[] = [
    ...requirePositiveNumber(input.area_m2, "area_m2", "Heat-transfer area"),
    ...requirePositiveNumber(input.thickness_m, "thickness_m", "Wall thickness"),
    ...requirePositiveNumber(input.thermalConductivity_W_mK, "thermalConductivity_W_mK", "Thermal conductivity"),
  ];

  if (typeof input.hotSideTemp_C !== "number" || Number.isNaN(input.hotSideTemp_C)) {
    issues.push({ field: "hotSideTemp_C", message: "Hot-side temperature must be a number." });
  }

  if (typeof input.coldSideTemp_C !== "number" || Number.isNaN(input.coldSideTemp_C)) {
    issues.push({ field: "coldSideTemp_C", message: "Cold-side temperature must be a number." });
  }

  if (issues.length === 0 && input.hotSideTemp_C <= input.coldSideTemp_C) {
    issues.push({ field: "hotSideTemp_C", message: "Hot-side temperature should be greater than cold-side temperature for positive heat flow." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const temperatureDifference_K = input.hotSideTemp_C - input.coldSideTemp_C;
  const heatTransferRate_W =
    (input.thermalConductivity_W_mK * input.area_m2 * temperatureDifference_K) / input.thickness_m;
  const heatFlux_W_m2 = heatTransferRate_W / input.area_m2;

  const result: ThermalConductionResult = {
    calculationType: "thermal_conduction",
    objective:
      input.objective ??
      "Estimate steady one-dimensional conductive heat transfer through a flat wall/slab.",
    confidenceLevel: "preliminary",
    inputs: {
      area_m2: { label: "Heat-transfer area", value: input.area_m2, unit: "m²", source: "user" },
      thickness_m: { label: "Wall/slab thickness", value: input.thickness_m, unit: "m", source: "user" },
      thermalConductivity_W_mK: { label: "Thermal conductivity", value: input.thermalConductivity_W_mK, unit: "W/m·K", source: "user" },
      hotSideTemp_C: { label: "Hot-side temperature", value: input.hotSideTemp_C, unit: "°C", source: "user" },
      coldSideTemp_C: { label: "Cold-side temperature", value: input.coldSideTemp_C, unit: "°C", source: "user" },
    },
    assumptions: [
      "Steady-state, one-dimensional conduction through a flat layer.",
      "Thermal conductivity is constant over the temperature range.",
      "No convection, radiation, contact resistance, internal heat generation, or edge losses are included.",
    ],
    missingData: [
      "Surface convection coefficients, radiation conditions, contact resistance, multi-layer construction, and temperature-dependent material properties if total thermal resistance is needed.",
    ],
    formulas: [
      { label: "Temperature difference", formula: "ΔT = T_hot - T_cold" },
      { label: "Fourier conduction", formula: "Q = k A ΔT / L" },
      { label: "Heat flux", formula: "q'' = Q / A" },
    ],
    steps: [
      { label: "Temperature difference", expression: `ΔT = ${input.hotSideTemp_C} - ${input.coldSideTemp_C}`, result: `${formatNumber(temperatureDifference_K, 3)} K` },
      { label: "Heat transfer", expression: `Q = ${input.thermalConductivity_W_mK} × ${input.area_m2} × ${formatNumber(temperatureDifference_K, 3)} / ${input.thickness_m}`, result: `${formatNumber(heatTransferRate_W, 3)} W` },
      { label: "Heat flux", expression: `q'' = ${formatNumber(heatTransferRate_W, 3)} / ${input.area_m2}`, result: `${formatNumber(heatFlux_W_m2, 3)} W/m²` },
    ],
    results: {
      temperatureDifference_K: { label: "Temperature difference", value: round(temperatureDifference_K, 3), unit: "K", precision: 3 },
      heatTransferRate_W: { label: "Heat transfer rate", value: round(heatTransferRate_W, 3), unit: "W", precision: 3 },
      heatFlux_W_m2: { label: "Heat flux", value: round(heatFlux_W_m2, 3), unit: "W/m²", precision: 3 },
    },
    warnings: [],
    limitations: [
      "This is a simple conduction-only estimate and not a full heat-transfer design model.",
      "Verify boundary conditions, material properties, and applicable thermal design criteria before use.",
    ],
    requiresProfessionalReview: false,
    generatedAt: new Date().toISOString(),
  };

  return { ok: true, result };
}
