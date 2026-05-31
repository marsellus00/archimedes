import type { CalculationOutcome, CalculationResult, ValidationIssue } from "@/lib/calculations/common/resultTypes";
import { formatNumber, requirePositiveNumber, round } from "@/lib/calculations/common/validation";

export type OpenChannelFlowInput = {
  channelWidth_m: number;
  flowDepth_m: number;
  channelSlope_m_m: number;
  manningN: number;
  objective?: string;
};

export type OpenChannelFlowResult = CalculationResult & {
  calculationType: "open_channel_flow";
  results: CalculationResult["results"] & {
    area_m2: { label: string; value: number; unit: "m²"; precision: number };
    hydraulicRadius_m: { label: string; value: number; unit: "m"; precision: number };
    velocity_m_s: { label: string; value: number; unit: "m/s"; precision: number };
    flowRate_m3_s: { label: string; value: number; unit: "m³/s"; precision: number };
  };
};

export function calculateOpenChannelFlow(
  input: OpenChannelFlowInput,
): CalculationOutcome<OpenChannelFlowResult> {
  const issues: ValidationIssue[] = [
    ...requirePositiveNumber(input.channelWidth_m, "channelWidth_m", "Channel bottom width"),
    ...requirePositiveNumber(input.flowDepth_m, "flowDepth_m", "Flow depth"),
    ...requirePositiveNumber(input.channelSlope_m_m, "channelSlope_m_m", "Channel slope"),
    ...requirePositiveNumber(input.manningN, "manningN", "Manning roughness coefficient"),
  ];

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const area_m2 = input.channelWidth_m * input.flowDepth_m;
  const wettedPerimeter_m = input.channelWidth_m + 2 * input.flowDepth_m;
  const hydraulicRadius_m = area_m2 / wettedPerimeter_m;
  const velocity_m_s =
    (1 / input.manningN) * hydraulicRadius_m ** (2 / 3) * Math.sqrt(input.channelSlope_m_m);
  const flowRate_m3_s = area_m2 * velocity_m_s;

  const result: OpenChannelFlowResult = {
    calculationType: "open_channel_flow",
    objective:
      input.objective ??
      "Estimate uniform open-channel flow velocity and discharge using Manning's equation for a rectangular channel.",
    confidenceLevel: "preliminary",
    inputs: {
      channelWidth_m: {
        label: "Rectangular channel width",
        value: input.channelWidth_m,
        unit: "m",
        source: "user",
      },
      flowDepth_m: {
        label: "Flow depth",
        value: input.flowDepth_m,
        unit: "m",
        source: "user",
      },
      channelSlope_m_m: {
        label: "Energy/channel slope",
        value: input.channelSlope_m_m,
        unit: "m/m",
        source: "user",
      },
      manningN: {
        label: "Manning n",
        value: input.manningN,
        source: "user",
      },
    },
    assumptions: [
      "Uniform, steady open-channel flow.",
      "Rectangular channel section with the entered width and flow depth.",
      "Channel slope is used as an approximation of the energy slope.",
      "Manning roughness coefficient represents the channel material and condition.",
    ],
    missingData: [
      "Freeboard, side slopes, bends, transitions, controls, and downstream water-level effects if this is for design.",
      "Channel material/condition verification for the Manning n value.",
    ],
    formulas: [
      { label: "Flow area", formula: "A = b y", description: "Rectangular channel area." },
      {
        label: "Wetted perimeter",
        formula: "P = b + 2y",
        description: "Wetted perimeter for a rectangular channel.",
      },
      { label: "Hydraulic radius", formula: "R = A / P" },
      {
        label: "Manning velocity",
        formula: "V = (1/n) R^(2/3) S^(1/2)",
        description: "Uniform open-channel flow velocity.",
      },
      { label: "Discharge", formula: "Q = A V" },
    ],
    steps: [
      {
        label: "Area",
        expression: `A = ${input.channelWidth_m} m × ${input.flowDepth_m} m`,
        result: `${formatNumber(area_m2, 4)} m²`,
      },
      {
        label: "Hydraulic radius",
        expression: `R = ${formatNumber(area_m2, 4)} / (${input.channelWidth_m} + 2×${input.flowDepth_m})`,
        result: `${formatNumber(hydraulicRadius_m, 4)} m`,
      },
      {
        label: "Velocity",
        expression: `V = (1/${input.manningN}) × ${formatNumber(hydraulicRadius_m, 4)}^(2/3) × √${input.channelSlope_m_m}`,
        result: `${formatNumber(velocity_m_s, 4)} m/s`,
      },
      {
        label: "Discharge",
        expression: `Q = ${formatNumber(area_m2, 4)} × ${formatNumber(velocity_m_s, 4)}`,
        result: `${formatNumber(flowRate_m3_s, 4)} m³/s`,
      },
    ],
    results: {
      area_m2: { label: "Flow area", value: round(area_m2, 4), unit: "m²", precision: 4 },
      hydraulicRadius_m: {
        label: "Hydraulic radius",
        value: round(hydraulicRadius_m, 4),
        unit: "m",
        precision: 4,
      },
      velocity_m_s: {
        label: "Mean velocity",
        value: round(velocity_m_s, 4),
        unit: "m/s",
        precision: 4,
      },
      flowRate_m3_s: {
        label: "Flow rate",
        value: round(flowRate_m3_s, 4),
        unit: "m³/s",
        precision: 4,
      },
    },
    warnings: [
      ...(velocity_m_s > 3
        ? ["Calculated velocity is relatively high; check erosion, lining, and permissible velocity criteria."]
        : []),
    ],
    limitations: [
      "Manning's equation is empirical and should be checked against the applicable drainage/hydraulic design criteria.",
      "This module does not model gradually varied flow, backwater, hydraulic jumps, sediment transport, culverts, controls, or flood routing.",
    ],
    requiresProfessionalReview: true,
    generatedAt: new Date().toISOString(),
  };

  return { ok: true, result };
}
