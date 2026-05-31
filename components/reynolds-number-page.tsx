"use client";

import { useCallback } from "react";
import { CalculationWorkspace } from "@/components/calculators/calculation-workspace";
import {
  calculateReynoldsNumberModule,
  type ReynoldsNumberInput,
} from "@/lib/calculations/fluid/reynoldsCalculation";

const initialValues: ReynoldsNumberInput = {
  diameter_m: 0.1,
  velocity_m_s: 2,
  density_kg_m3: 998,
  viscosity_pa_s: 0.001002,
};

export function ReynoldsNumberPage() {
  const calculate = useCallback(
    (values: ReynoldsNumberInput) => calculateReynoldsNumberModule(values),
    [],
  );

  return (
    <CalculationWorkspace
      title="Reynolds Number Calculator"
      eyebrow="Fluid mechanics module"
      description="Calculate Reynolds number and classify laminar, transitional, or turbulent flow using deterministic calculation logic."
      endpoint="/api/calculations/fluid/reynolds"
      initialValues={initialValues}
      calculate={calculate}
      primaryResults={["reynoldsNumber", "flowRegime"]}
      fields={[
        { key: "diameter_m", label: "Hydraulic diameter", unit: "m", step: 0.01, min: 0.0001 },
        { key: "velocity_m_s", label: "Mean velocity", unit: "m/s", step: 0.1, min: 0.0001 },
        { key: "density_kg_m3", label: "Fluid density", unit: "kg/m³", step: 1, min: 0.0001 },
        { key: "viscosity_pa_s", label: "Dynamic viscosity", unit: "Pa·s", step: 0.000001, min: 0.0000001 },
      ]}
    />
  );
}
