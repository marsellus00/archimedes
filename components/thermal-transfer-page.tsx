"use client";

import { useCallback } from "react";
import { CalculationWorkspace } from "@/components/calculators/calculation-workspace";
import {
  calculateThermalConduction,
  type ThermalConductionInput,
} from "@/lib/calculations/thermal/conduction";

const initialValues: ThermalConductionInput = {
  area_m2: 2,
  thickness_m: 0.1,
  thermalConductivity_W_mK: 0.8,
  hotSideTemp_C: 80,
  coldSideTemp_C: 25,
};

export function ThermalTransferPage() {
  const calculate = useCallback(
    (values: ThermalConductionInput) => calculateThermalConduction(values),
    [],
  );

  return (
    <CalculationWorkspace
      title="Thermal Transfer Calculator"
      eyebrow="Heat-transfer module"
      description="Estimate steady one-dimensional conductive heat transfer through a flat wall or slab."
      endpoint="/api/calculations/thermal/conduction"
      initialValues={initialValues}
      calculate={calculate}
      primaryResults={["heatTransferRate_W", "heatFlux_W_m2", "temperatureDifference_K"]}
      fields={[
        { key: "area_m2", label: "Heat-transfer area", unit: "m²", step: 0.1, min: 0.001 },
        { key: "thickness_m", label: "Thickness", unit: "m", step: 0.01, min: 0.001 },
        { key: "thermalConductivity_W_mK", label: "Thermal conductivity", unit: "W/m·K", step: 0.1, min: 0.001 },
        { key: "hotSideTemp_C", label: "Hot-side temperature", unit: "°C", step: 1 },
        { key: "coldSideTemp_C", label: "Cold-side temperature", unit: "°C", step: 1 },
      ]}
    />
  );
}
