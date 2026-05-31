"use client";

import { useCallback } from "react";
import { CalculationWorkspace } from "@/components/calculators/calculation-workspace";
import {
  calculateVoltageDrop,
  type VoltageDropInput,
} from "@/lib/calculations/electrical/voltageDrop";

const initialValues: VoltageDropInput = {
  current_A: 80,
  oneWayLength_m: 75,
  conductorResistance_ohm_km: 0.727,
  systemVoltage_V: 400,
  powerFactor: 0.9,
  phaseCount: 3,
};

export function VoltageDropPage() {
  const calculate = useCallback((values: VoltageDropInput) => calculateVoltageDrop(values), []);

  return (
    <CalculationWorkspace
      title="Voltage Drop Calculator"
      eyebrow="Electrical screening module"
      description="Estimate preliminary circuit voltage drop using current, conductor resistance, length, phase configuration, and power factor."
      endpoint="/api/calculations/electrical/voltage-drop"
      initialValues={initialValues}
      calculate={calculate}
      primaryResults={["voltageDrop_V", "voltageDrop_percent", "receivingVoltage_V"]}
      fields={[
        { key: "current_A", label: "Load current", unit: "A", step: 1, min: 0.001 },
        { key: "oneWayLength_m", label: "One-way length", unit: "m", step: 1, min: 0.001 },
        { key: "conductorResistance_ohm_km", label: "Conductor resistance", unit: "Ω/km", step: 0.001, min: 0.000001 },
        { key: "systemVoltage_V", label: "System voltage", unit: "V", step: 1, min: 1 },
        { key: "powerFactor", label: "Power factor", step: 0.01, min: 0.01 },
        { key: "phaseCount", label: "Phase count", step: 1, min: 1, helper: "Enter 3 for three-phase; 1 for single-phase/two-wire equivalent." },
      ]}
    />
  );
}
