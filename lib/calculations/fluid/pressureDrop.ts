import type {
 CalculationOutcome,
 CalculationResult,
} from "@/lib/calculations/common/resultTypes";
import { formatNumber, round } from "@/lib/calculations/common/validation";
import { pascalsToKilopascals } from "@/lib/calculations/units/convert";
import {
 calculateDarcyFrictionFactor,
 type FrictionFactorResult,
} from "@/lib/calculations/fluid/frictionFactor";
import {
 calculateReynoldsNumber,
 classifyFlowRegime,
 type FlowRegime,
} from "@/lib/calculations/fluid/reynolds";
import {
 DEFAULT_COMMERCIAL_STEEL_ROUGHNESS_M,
 type FluidPressureDropInput,
 validateFluidPressureDropInput,
} from "@/lib/calculations/fluid/schemas";

export type FluidPressureDropResult = CalculationResult & {
 calculationType: "fluid_pressure_drop";
 results: CalculationResult["results"] & {
 flowRegime: { label: string; value: FlowRegime };
 reynoldsNumber: { label: string; value: number; precision: number };
 frictionFactor: { label: string; value: number; precision: number };
 majorPressureDrop_Pa: { label: string; value: number; unit: "Pa"; precision: number };
 totalPressureDrop_Pa: { label: string; value: number; unit: "Pa"; precision: number };
 totalPressureDrop_kPa: { label: string; value: number; unit: "kPa"; precision: number };
 volumetricFlowRate_m3_s: { label: string; value: number; unit: "m³/s"; precision: number };
 };
 fluid: {
 flowRegime: FlowRegime;
 frictionFactorMethod: FrictionFactorResult["method"];
 relativeRoughness: number;
 };
};

export function calculateFluidPressureDrop(
 input: FluidPressureDropInput,
): CalculationOutcome<FluidPressureDropResult> {
 const issues = validateFluidPressureDropInput(input);

 if (issues.length > 0) {
 return {
 ok: false,
 issues,
 };
 }

 const roughness_m = input.roughness_m ?? DEFAULT_COMMERCIAL_STEEL_ROUGHNESS_M;
 const minorLossCoefficient = input.minorLossCoefficient ?? 0;

 const area_m2 = (Math.PI * input.diameter_m ** 2) / 4;
 const volumetricFlowRate_m3_s = area_m2 * input.velocity_m_s;
 const reynoldsNumber = calculateReynoldsNumber(input);
 const flowRegime = classifyFlowRegime(reynoldsNumber);
 const friction = calculateDarcyFrictionFactor({
 reynoldsNumber,
 diameter_m: input.diameter_m,
 roughness_m,
 regime: flowRegime,
 });
 const dynamicPressure_Pa = (input.density_kg_m3 * input.velocity_m_s ** 2) / 2;
 const majorPressureDrop_Pa =
 friction.frictionFactor * (input.length_m / input.diameter_m) * dynamicPressure_Pa;
 const minorPressureDrop_Pa = minorLossCoefficient * dynamicPressure_Pa;
 const totalPressureDrop_Pa = majorPressureDrop_Pa + minorPressureDrop_Pa;
 const totalPressureDrop_kPa = pascalsToKilopascals(totalPressureDrop_Pa);
 const relativeRoughness = roughness_m / input.diameter_m;

 const assumptions = [
 "Steady, incompressible, single-phase internal pipe flow.",
 "Pipe is flowing full with a circular internal diameter.",
 "Darcy-Weisbach equation is used for major friction losses.",
 input.roughness_m === undefined
 ? `Pipe roughness was not supplied; defaulted to commercial steel roughness of ${DEFAULT_COMMERCIAL_STEEL_ROUGHNESS_M} m.`
 : "Pipe roughness was supplied by the user.",
 minorLossCoefficient > 0
 ? "Minor losses are included using the supplied combined K coefficient."
 : "Minor losses are not included because the combined K coefficient is zero.",
 ];

 const warnings = [
 ...friction.warnings,
 ...(input.temperature_C === undefined
 ? [
 "Temperature was not supplied; density and viscosity are treated as user-provided constants and are not temperature-corrected.",
 ]
 : []),
 ];

 const result: FluidPressureDropResult = {
 calculationType: "fluid_pressure_drop",
 objective:
 input.objective ??
 "Estimate Reynolds number, flow regime, Darcy friction factor, volumetric flow rate, and pressure drop for straight-pipe flow.",
 confidenceLevel: flowRegime === "Transitional" ? "rough_estimate" : "preliminary",
 inputs: {
 diameter_m: {
 label: "Pipe internal diameter",
 value: input.diameter_m,
 unit: "m",
 source: "user",
 },
 length_m: {
 label: "Pipe length",
 value: input.length_m,
 unit: "m",
 source: "user",
 },
 velocity_m_s: {
 label: "Mean flow velocity",
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
 roughness_m: {
 label: "Absolute roughness",
 value: roughness_m,
 unit: "m",
 source: input.roughness_m === undefined ? "default" : "user",
 },
 minorLossCoefficient: {
 label: "Combined minor-loss coefficient",
 value: minorLossCoefficient,
 source: input.minorLossCoefficient === undefined ? "default" : "user",
 },
 fluidName: {
 label: "Fluid",
 value: input.fluidName ?? "Not specified",
 source: input.fluidName ? "user" : "default",
 },
 pipeMaterial: {
 label: "Pipe material",
 value: input.pipeMaterial ?? "Not specified",
 source: input.pipeMaterial ? "user" : "default",
 },
 },
 assumptions,
 missingData: [
 ...(input.temperature_C === undefined ? ["Fluid temperature for property verification."] : []),
 ...(minorLossCoefficient === 0
 ? ["Fittings, valves, entrance/exit losses, and other minor-loss K values if total system pressure drop is required."]
 : []),
 ],
 formulas: [
 {
 label: "Pipe area",
 formula: "A = πD² / 4",
 description: "Circular pipe cross-sectional area.",
 },
 {
 label: "Volumetric flow rate",
 formula: "Q = A v",
 description: "Mean velocity multiplied by pipe area.",
 },
 {
 label: "Reynolds number",
 formula: "Re = ρ v D / μ",
 description: "Dimensionless ratio of inertial to viscous effects.",
 },
 {
 label: "Darcy-Weisbach pressure drop",
 formula: "ΔP_major = f (L / D) (ρv² / 2)",
 description: "Major pressure loss due to wall friction.",
 },
 {
 label: "Minor pressure losses",
 formula: "ΔP_minor = K (ρv² / 2)",
 description: "Optional combined fitting/minor losses.",
 },
 ],
 steps: [
 {
 label: "Area",
 expression: `A = π × (${input.diameter_m} m)² / 4`,
 result: `${formatNumber(area_m2, 6)} m²`,
 },
 {
 label: "Flow rate",
 expression: `Q = ${formatNumber(area_m2, 6)} m² × ${input.velocity_m_s} m/s`,
 result: `${formatNumber(volumetricFlowRate_m3_s, 6)} m³/s`,
 },
 {
 label: "Reynolds number",
 expression: `Re = (${input.density_kg_m3} kg/m³ × ${input.velocity_m_s} m/s × ${input.diameter_m} m) / ${input.viscosity_pa_s} Pa·s`,
 result: `${formatNumber(reynoldsNumber, 2)} (${flowRegime})`,
 },
 {
 label: "Friction factor",
 expression: friction.method,
 result: `f = ${formatNumber(friction.frictionFactor, 5)}`,
 },
 {
 label: "Major pressure drop",
 expression: `ΔP = ${formatNumber(friction.frictionFactor, 5)} × (${input.length_m} / ${input.diameter_m}) × (${input.density_kg_m3} × ${input.velocity_m_s}² / 2)`,
 result: `${formatNumber(majorPressureDrop_Pa, 2)} Pa`,
 },
 {
 label: "Total pressure drop",
 expression: `ΔP_total = ΔP_major + K(ρv²/2), K = ${minorLossCoefficient}`,
 result: `${formatNumber(totalPressureDrop_kPa, 3)} kPa`,
 },
 ],
 results: {
 flowRegime: {
 label: "Flow regime",
 value: flowRegime,
 },
 reynoldsNumber: {
 label: "Reynolds number",
 value: round(reynoldsNumber, 2),
 precision: 2,
 },
 frictionFactor: {
 label: "Darcy friction factor",
 value: round(friction.frictionFactor, 6),
 precision: 6,
 },
 majorPressureDrop_Pa: {
 label: "Major pressure drop",
 value: round(majorPressureDrop_Pa, 2),
 unit: "Pa",
 precision: 2,
 },
 totalPressureDrop_Pa: {
 label: "Total pressure drop",
 value: round(totalPressureDrop_Pa, 2),
 unit: "Pa",
 precision: 2,
 },
 totalPressureDrop_kPa: {
 label: "Total pressure drop",
 value: round(totalPressureDrop_kPa, 3),
 unit: "kPa",
 precision: 3,
 },
 volumetricFlowRate_m3_s: {
 label: "Volumetric flow rate",
 value: round(volumetricFlowRate_m3_s, 6),
 unit: "m³/s",
 precision: 6,
 },
 },
 warnings,
 limitations: [
 "This is a preliminary calculation module, not final engineering approval.",
 "It does not account for elevation change, pumps, heat transfer, compressibility, multiphase flow, non-Newtonian behavior, pipe aging, fouling, or detailed fitting-by-fitting losses unless separately modeled.",
 "Verify pipe internal diameter, roughness, fluid properties, fittings, allowable pressure drop, and project specification before use.",
 ],
 requiresProfessionalReview: true,
 generatedAt: new Date().toISOString(),
 fluid: {
 flowRegime,
 frictionFactorMethod: friction.method,
 relativeRoughness,
 },
 };

 return {
 ok: true,
 result,
 };
}
