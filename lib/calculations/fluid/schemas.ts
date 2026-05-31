import type { ValidationIssue } from "@/lib/calculations/common/resultTypes";
import {
  optionalNonNegativeNumber,
  requirePositiveNumber,
} from "@/lib/calculations/common/validation";

export const DEFAULT_COMMERCIAL_STEEL_ROUGHNESS_M = 0.000046;

export type FluidPressureDropInput = {
  diameter_m: number;
  length_m: number;
  velocity_m_s: number;
  density_kg_m3: number;
  viscosity_pa_s: number;
  roughness_m?: number;
  minorLossCoefficient?: number;
  fluidName?: string;
  pipeMaterial?: string;
  temperature_C?: number;
  objective?: string;
};

export type FluidPressureDropRequest = Partial<FluidPressureDropInput> & {
  diameter_mm?: number;
  length_m?: number;
  velocity_m_s?: number;
  density_kg_m3?: number;
  viscosity_pa_s?: number;
  roughness_mm?: number;
};

export function normalizeFluidPressureDropInput(
  request: FluidPressureDropRequest,
): FluidPressureDropInput {
  const diameter_m =
    typeof request.diameter_m === "number"
      ? request.diameter_m
      : typeof request.diameter_mm === "number"
        ? request.diameter_mm / 1000
        : Number.NaN;

  const roughness_m =
    typeof request.roughness_m === "number"
      ? request.roughness_m
      : typeof request.roughness_mm === "number"
        ? request.roughness_mm / 1000
        : undefined;

  return {
    diameter_m,
    length_m: request.length_m ?? Number.NaN,
    velocity_m_s: request.velocity_m_s ?? Number.NaN,
    density_kg_m3: request.density_kg_m3 ?? Number.NaN,
    viscosity_pa_s: request.viscosity_pa_s ?? Number.NaN,
    roughness_m,
    minorLossCoefficient: request.minorLossCoefficient ?? 0,
    fluidName: request.fluidName,
    pipeMaterial: request.pipeMaterial,
    temperature_C: request.temperature_C,
    objective: request.objective,
  };
}

export function validateFluidPressureDropInput(
  input: FluidPressureDropInput,
): ValidationIssue[] {
  return [
    ...requirePositiveNumber(input.diameter_m, "diameter_m", "Pipe diameter"),
    ...requirePositiveNumber(input.length_m, "length_m", "Pipe length"),
    ...requirePositiveNumber(input.velocity_m_s, "velocity_m_s", "Flow velocity"),
    ...requirePositiveNumber(input.density_kg_m3, "density_kg_m3", "Fluid density"),
    ...requirePositiveNumber(input.viscosity_pa_s, "viscosity_pa_s", "Dynamic viscosity"),
    ...optionalNonNegativeNumber(input.roughness_m, "roughness_m", "Pipe roughness"),
    ...optionalNonNegativeNumber(
      input.minorLossCoefficient,
      "minorLossCoefficient",
      "Minor-loss coefficient",
    ),
  ];
}
