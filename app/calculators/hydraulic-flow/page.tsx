import { AppShell } from "@/components/app-shell";
import { HydraulicFlowPage } from "@/components/hydraulic-flow-page";

export default function HydraulicFlowRoute() {
  return (
    <AppShell title="Hydraulic Flow">
      <HydraulicFlowPage />
    </AppShell>
  );
}
