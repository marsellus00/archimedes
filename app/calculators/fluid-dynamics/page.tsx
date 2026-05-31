import { AppShell } from "@/components/app-shell";
import { FluidDynamicsPage } from "@/components/fluid-dynamics-page";

export default function FluidDynamicsRoute() {
  return (
    <AppShell title="Fluid Dynamics">
      <FluidDynamicsPage />
    </AppShell>
  );
}