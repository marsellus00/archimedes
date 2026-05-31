import { AppShell } from "@/components/app-shell";
import { SecurityPage } from "@/components/security-page";

export default function SecurityRoute() {
  return (
    <AppShell title="Security">
      <SecurityPage />
    </AppShell>
  );
}