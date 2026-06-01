import type { CalculationOutcome, CalculationResult, ValidationIssue } from "@/lib/calculations/common/resultTypes";
import { formatNumber, requirePositiveNumber, round } from "@/lib/calculations/common/validation";

export type VoltageDropInput = {
 current_A: number;
 oneWayLength_m: number;
 conductorResistance_ohm_km: number;
 systemVoltage_V: number;
 powerFactor: number;
 phaseCount: number;
 objective?: string;
};

export type VoltageDropResult = CalculationResult & {
 calculationType: "voltage_drop";
 results: CalculationResult["results"] & {
 voltageDrop_V: { label: string; value: number; unit: "V"; precision: number };
 voltageDrop_percent: { label: string; value: number; unit: "%"; precision: number };
 receivingVoltage_V: { label: string; value: number; unit: "V"; precision: number };
 };
};

export function calculateVoltageDrop(input: VoltageDropInput): CalculationOutcome<VoltageDropResult> {
 const issues: ValidationIssue[] = [
 ...requirePositiveNumber(input.current_A, "current_A", "Load current"),
 ...requirePositiveNumber(input.oneWayLength_m, "oneWayLength_m", "One-way circuit length"),
 ...requirePositiveNumber(input.conductorResistance_ohm_km, "conductorResistance_ohm_km", "Conductor resistance"),
 ...requirePositiveNumber(input.systemVoltage_V, "systemVoltage_V", "Nominal system voltage"),
 ...requirePositiveNumber(input.powerFactor, "powerFactor", "Power factor"),
 ...requirePositiveNumber(input.phaseCount, "phaseCount", "Phase count"),
 ];

 if (input.powerFactor > 1) {
 issues.push({ field: "powerFactor", message: "Power factor must be less than or equal to 1." });
 }

 if (issues.length > 0) {
 return { ok: false, issues };
 }

 const resistance_ohm_m = input.conductorResistance_ohm_km / 1000;
 const isThreePhase = input.phaseCount >= 3;
 const multiplier = isThreePhase ? Math.sqrt(3) : 2;
 const voltageDrop_V =
 multiplier * input.current_A * input.oneWayLength_m * resistance_ohm_m * input.powerFactor;
 const voltageDrop_percent = (voltageDrop_V / input.systemVoltage_V) * 100;
 const receivingVoltage_V = input.systemVoltage_V - voltageDrop_V;

 const result: VoltageDropResult = {
 calculationType: "voltage_drop",
 objective:
 input.objective ??
 "Estimate preliminary circuit voltage drop using conductor resistance, current, length, phase configuration, and power factor.",
 confidenceLevel: "preliminary",
 inputs: {
 current_A: { label: "Load current", value: input.current_A, unit: "A", source: "user" },
 oneWayLength_m: { label: "One-way circuit length", value: input.oneWayLength_m, unit: "m", source: "user" },
 conductorResistance_ohm_km: { label: "Conductor resistance", value: input.conductorResistance_ohm_km, unit: "Ω/km", source: "user" },
 systemVoltage_V: { label: "Nominal system voltage", value: input.systemVoltage_V, unit: "V", source: "user" },
 powerFactor: { label: "Power factor", value: input.powerFactor, source: "user" },
 phaseCount: { label: "Phase configuration", value: isThreePhase ? "3-phase" : "1-phase / DC two-wire equivalent", source: "user" },
 },
 assumptions: [
 isThreePhase
 ? "Three-phase voltage drop multiplier √3 is used."
 : "Single-phase/two-wire voltage drop multiplier 2 is used.",
 "Reactance is not included; the entered resistance is treated as the dominant impedance component.",
 "Conductor temperature and installation conditions are not corrected.",
 ],
 missingData: [
 "Conductor material/size, installation temperature, reactance, load diversity, permissible voltage-drop criterion, and applicable electrical code or project standard.",
 ],
 formulas: [
 { label: "Single-phase voltage drop", formula: "ΔV = 2 I L R cosφ" },
 { label: "Three-phase voltage drop", formula: "ΔV = √3 I L R cosφ" },
 { label: "Voltage-drop percentage", formula: "%VD = ΔV / V_nom × 100" },
 ],
 steps: [
 { label: "Resistance conversion", expression: `R = ${input.conductorResistance_ohm_km} Ω/km / 1000`, result: `${formatNumber(resistance_ohm_m, 6)} Ω/m` },
 { label: "Voltage drop", expression: `ΔV = ${formatNumber(multiplier, 4)} × ${input.current_A} × ${input.oneWayLength_m} × ${formatNumber(resistance_ohm_m, 6)} × ${input.powerFactor}`, result: `${formatNumber(voltageDrop_V, 3)} V` },
 { label: "Percentage", expression: `%VD = ${formatNumber(voltageDrop_V, 3)} / ${input.systemVoltage_V} × 100`, result: `${formatNumber(voltageDrop_percent, 3)} %` },
 ],
 results: {
 voltageDrop_V: { label: "Voltage drop", value: round(voltageDrop_V, 3), unit: "V", precision: 3 },
 voltageDrop_percent: { label: "Voltage drop", value: round(voltageDrop_percent, 3), unit: "%", precision: 3 },
 receivingVoltage_V: { label: "Estimated receiving voltage", value: round(receivingVoltage_V, 3), unit: "V", precision: 3 },
 },
 warnings: [
 ...(voltageDrop_percent > 5 ? ["Voltage drop exceeds 5%; check applicable code/project limits and consider conductor upsizing or circuit changes."] : []),
 "Electrical design and installation require compliance with applicable codes and qualified review.",
 ],
 limitations: [
 "This module omits conductor reactance, temperature correction, protective device coordination, fault level, voltage regulation, harmonic effects, and code-specific requirements.",
 ],
 requiresProfessionalReview: true,
 generatedAt: new Date().toISOString(),
 };

 return { ok: true, result };
}
