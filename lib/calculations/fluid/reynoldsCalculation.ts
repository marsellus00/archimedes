import type { CalculationOutcome, CalculationResult } from "@/lib/calculations/common/resultTypes";
import { formatNumber, requirePositiveNumber, round } from "@/lib/calculations/common/validation";
import { calculateReynoldsNumber, classifyFlowRegime, type FlowRegime } from "@/lib/calculations/fluid/reynolds";

export type ReynoldsNumberInput = {
  diameter_m: number;
  velocity_m_s: number;
  density_kg_m3: number;
  viscosity_pa_s: number;
  objective?: string;
};

export type ReynoldsNumberResult = CalculationResult & {
  calculationType: "reynolds_number";
  results: CalculationResult["results"] & {
    reynoldsNumber: { label: string; value: number; precision: number };
    flowRegime: { label: string; value: FlowRegime };
  };
};

export function calculateReynoldsNumberModule(
  input: ReynoldsNumberInput,
): CalculationOutcome<ReynoldsNumberResult> {
  const issues = [
    ...requirePositiveNumber(input.diameter_m, "diameter_m", "Hydraulic diameter"),
    ...requirePositiveNumber(input.velocity_m_s, "velocity_m_s", "Mean velocity"),
    ...requirePositiveNumber(input.density_kg_m3, "density_kg_m3", "Fluid density"),
    ...requirePositiveNumber(input.viscosity_pa_s, "viscosity_pa_s", "Dynamic viscosity"),
  ];

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const reynoldsNumber = calculateReynoldsNumber(input);
  const flowRegime = classifyFlowRegime(reynoldsNumber);

  const result: ReynoldsNumberResult = {
    calculationType: "reynolds_number",
    objective:
      input.objective ??
      "Calculate Reynolds number and classify the flow regime for internal flow.",
    confidenceLevel: flowRegime === "Transitional" ? "rough_estimate" : "preliminary",
    inputs: {
      diameter_m: {
        label: "Hydraulic/internal diameter",
        value: input.diameter_m,
        unit: "m",
        source: "user",
      },
      velocity_m_s: {
        label: "Mean velocity",
        value: input.velocity_m_s,
        unit: "m/s",
        source: "user",
      },
      density_kg_m3: {
        label: "Fluid density",
        value: input.density_kg_m3,
        unit: "kg/m³",
        source: "user",
      },
      viscosity_pa_s: {
        label: "Dynamic viscosity",
        value: input.viscosity_pa_s,
        unit: "Pa·s",
        source: "user",
      },
    },
    assumptions: [
      "Fluid properties are treated as constant for the stated conditions.",
      "The supplied diameter is the hydraulic diameter for the flow passage.",
      "The velocity is the bulk mean velocity.",
    ],
    missingData: [
      "Fluid temperature if density and viscosity need to be verified from property tables.",
      "Pipe/channel geometry details if the supplied diameter is not the hydraulic diameter.",
    ],
    formulas: [
      {
        label: "Reynolds number",
        formula: "Re = ρ v D / μ",
        description: "Dimensionless ratio of inertial to viscous forces.",
      },
      {
        label: "Flow regime guide",
        formula: "Laminar < 2300; Transitional 2300–4000; Turbulent > 4000",
        description: "Common internal pipe-flow screening thresholds.",
      },
    ],
    steps: [
      {
        label: "Substitute values",
        expression: `Re = (${input.density_kg_m3} kg/m³ × ${input.velocity_m_s} m/s × ${input.diameter_m} m) / ${input.viscosity_pa_s} Pa·s`,
        result: `Re = ${formatNumber(reynoldsNumber, 2)}`,
      },
      {
        label: "Classify flow",
        expression: "Compare Reynolds number against common internal-flow regime thresholds.",
        result: flowRegime,
      },
    ],
    results: {
      reynoldsNumber: {
        label: "Reynolds number",
        value: round(reynoldsNumber, 2),
        precision: 2,
      },
      flowRegime: {
        label: "Flow regime",
        value: flowRegime,
      },
    },
    warnings:
      flowRegime === "Transitional"
        ? [
            "Flow is in the transitional region; measured behavior may vary and pressure-loss correlations are less reliable.",
          ]
        : [],
    limitations: [
      "This is a screening calculation and does not by itself determine pressure loss, pump sizing, or system acceptability.",
      "Regime thresholds are conventional guides and may vary for non-circular, rough, pulsating, compressible, or non-Newtonian flows.",
    ],
    requiresProfessionalReview: false,
    generatedAt: new Date().toISOString(),
  };

  return { ok: true, result };
}
