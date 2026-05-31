import { AppShell } from "@/components/app-shell";
import { VoltageDropPage } from "@/components/voltage-drop-page";

export default function VoltageDropRoute() {
  return (
    <AppShell title="Voltage Drop">
      <VoltageDropPage />
    </AppShell>
  );
}
