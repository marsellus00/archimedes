import type { FlowRegime } from "@/lib/calculations/fluid/reynolds";

export type FrictionFactorResult = {
  frictionFactor: number;
  method: "Hagen-Poiseuille laminar" | "Swamee-Jain turbulent" | "Transitional estimate";
  warnings: string[];
};

export function calculateDarcyFrictionFactor(input: {
  reynoldsNumber: number;
  diameter_m: number;
  roughness_m: number;
  regime: FlowRegime;
}): FrictionFactorResult {
  const { reynoldsNumber, diameter_m, roughness_m, regime } = input;

  if (regime === "Laminar") {
    return {
      frictionFactor: 64 / reynoldsNumber,
      method: "Hagen-Poiseuille laminar",
      warnings: [],
    };
  }

  const turbulentFrictionFactor = calculateSwameeJainFrictionFactor({
    reynoldsNumber,
    diameter_m,
    roughness_m,
  });

  if (regime === "Transitional") {
    const laminarAt2300 = 64 / 2300;
    const blendRatio = (reynoldsNumber - 2300) / (4000 - 2300);
    const blended = laminarAt2300 + blendRatio * (turbulentFrictionFactor - laminarAt2300);

    return {
      frictionFactor: blended,
      method: "Transitional estimate",
      warnings: [
        "Reynolds number is in the transitional range. Friction factor and pressure drop are uncertain; confirm with project standards, test data, or a qualified engineering method.",
      ],
    };
  }

  return {
    frictionFactor: turbulentFrictionFactor,
    method: "Swamee-Jain turbulent",
    warnings: [],
  };
}

export function calculateSwameeJainFrictionFactor(input: {
  reynoldsNumber: number;
  diameter_m: number;
  roughness_m: number;
}): number {
  const relativeRoughnessTerm = input.roughness_m / (3.7 * input.diameter_m);
  const reynoldsTerm = 5.74 / input.reynoldsNumber ** 0.9;
  return 0.25 / Math.log10(relativeRoughnessTerm + reynoldsTerm) ** 2;
}
