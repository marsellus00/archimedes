export type FlowRegime = "Laminar" | "Transitional" | "Turbulent";

export function calculateReynoldsNumber(input: {
 density_kg_m3: number;
 velocity_m_s: number;
 diameter_m: number;
 viscosity_pa_s: number;
}): number {
 return (
 input.density_kg_m3 * input.velocity_m_s * input.diameter_m
 ) / input.viscosity_pa_s;
}

export function classifyFlowRegime(reynoldsNumber: number): FlowRegime {
 if (reynoldsNumber < 2300) {
 return "Laminar";
 }

 if (reynoldsNumber < 4000) {
 return "Transitional";
 }

 return "Turbulent";
}
