"use client";

import { useCallback } from "react";
import { CalculationWorkspace } from "@/components/calculators/calculation-workspace";
import {
 calculateColumnBuckling,
 type ColumnBucklingInput,
} from "@/lib/calculations/structural/columnBuckling";

const initialValues: ColumnBucklingInput = {
 length_m: 3,
 effectiveLengthFactor: 1,
 elasticModulus_GPa: 200,
 momentOfInertia_cm4: 850,
 area_cm2: 25,
 appliedLoad_kN: 120,
};

export function ColumnBucklingPage() {
 const calculate = useCallback((values: ColumnBucklingInput) => calculateColumnBuckling(values), []);

 return (
 <CalculationWorkspace
 title="Column Buckling Calculator"
 eyebrow="Structural screening module"
 description="Estimate Euler elastic buckling load, slenderness ratio, and preliminary buckling factor of safety."
 endpoint="/api/calculations/structural/column-buckling"
 initialValues={initialValues}
 calculate={calculate}
 primaryResults={["criticalLoad_kN", "factorOfSafety", "slendernessRatio"]}
 fields={[
 { key: "length_m", label: "Unsupported length", unit: "m", step: 0.1, min: 0.01 },
 { key: "effectiveLengthFactor", label: "Effective length factor K", step: 0.1, min: 0.1 },
 { key: "elasticModulus_GPa", label: "Elastic modulus", unit: "GPa", step: 1, min: 0.1 },
 { key: "momentOfInertia_cm4", label: "Least-axis inertia", unit: "cm⁴", step: 1, min: 0.001 },
 { key: "area_cm2", label: "Cross-sectional area", unit: "cm²", step: 0.1, min: 0.001 },
 { key: "appliedLoad_kN", label: "Applied axial load", unit: "kN", step: 1, min: 0.001 },
 ]}
 />
 );
}
