import { AppShell } from "@/components/app-shell";
import { CalculatorsPage } from "@/components/calculators-page";

export default function CalculatorsRoute() {
  return (
    <AppShell title="Calculators">
      <CalculatorsPage />
    </AppShell>
  );
}