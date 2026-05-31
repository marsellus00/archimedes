"use client";

import { useCallback } from "react";
import { CalculationWorkspace } from "@/components/calculators/calculation-workspace";
import {
  calculateRetainingWallStability,
  type RetainingWallInput,
} from "@/lib/calculations/structural/retainingWall";

const initialValues: RetainingWallInput = {
  wallHeight_m: 3,
  soilUnitWeight_kN_m3: 18,
  frictionAngle_deg: 30,
  surcharge_kPa: 5,
  baseWidth_m: 2,
  wallWeight_kN_per_m: 85,
  baseFrictionCoefficient: 0.5,
};

export function RetainingWallPage() {
  const calculate = useCallback(
    (values: RetainingWallInput) => calculateRetainingWallStability(values),
    [],
  );

  return (
    <CalculationWorkspace
      title="Retaining Wall Stability Calculator"
      eyebrow="Civil / structural screening module"
      description="Run a preliminary gravity-wall screening check for active earth pressure, sliding, and overturning."
      endpoint="/api/calculations/structural/retaining-wall"
      initialValues={initialValues}
      calculate={calculate}
      primaryResults={["factorOfSafetySliding", "factorOfSafetyOverturning", "activeForce_kN_per_m", "activePressureCoefficient"]}
      fields={[
        { key: "wallHeight_m", label: "Retained height", unit: "m", step: 0.1, min: 0.1 },
        { key: "soilUnitWeight_kN_m3", label: "Soil unit weight", unit: "kN/m³", step: 0.5, min: 1 },
        { key: "frictionAngle_deg", label: "Soil friction angle", unit: "deg", step: 1, min: 0 },
        { key: "surcharge_kPa", label: "Uniform surcharge", unit: "kPa", step: 1, min: 0 },
        { key: "baseWidth_m", label: "Base width", unit: "m", step: 0.1, min: 0.1 },
        { key: "wallWeight_kN_per_m", label: "Wall self-weight", unit: "kN/m", step: 1, min: 0.1 },
        { key: "baseFrictionCoefficient", label: "Base friction coefficient", step: 0.05, min: 0.01 },
      ]}
    />
  );
}
