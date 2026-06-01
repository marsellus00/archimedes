"use client";

import { useCallback } from "react";
import { CalculationWorkspace } from "@/components/calculators/calculation-workspace";
import {
 calculateOpenChannelFlow,
 type OpenChannelFlowInput,
} from "@/lib/calculations/hydraulic/openChannelFlow";

const initialValues: OpenChannelFlowInput = {
 channelWidth_m: 2,
 flowDepth_m: 0.6,
 channelSlope_m_m: 0.001,
 manningN: 0.015,
};

export function HydraulicFlowPage() {
 const calculate = useCallback((values: OpenChannelFlowInput) => calculateOpenChannelFlow(values), []);

 return (
 <CalculationWorkspace
 title="Hydraulic Flow Calculator"
 eyebrow="Open-channel flow module"
 description="Estimate uniform open-channel velocity and discharge using Manning's equation for a rectangular channel."
 endpoint="/api/calculations/hydraulic/open-channel-flow"
 initialValues={initialValues}
 calculate={calculate}
 primaryResults={["flowRate_m3_s", "velocity_m_s", "hydraulicRadius_m", "area_m2"]}
 fields={[
 { key: "channelWidth_m", label: "Channel width", unit: "m", step: 0.1, min: 0.0001 },
 { key: "flowDepth_m", label: "Flow depth", unit: "m", step: 0.05, min: 0.0001 },
 { key: "channelSlope_m_m", label: "Channel slope", unit: "m/m", step: 0.0001, min: 0.000001 },
 { key: "manningN", label: "Manning n", step: 0.001, min: 0.0001, helper: "Typical finished concrete can be around 0.012–0.015; verify for the actual channel." },
 ]}
 />
 );
}
