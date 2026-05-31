import { AppShell } from "@/components/app-shell";
import { IntegrationsPage } from "@/components/integrations-page";

export default function IntegrationsRoute() {
  return (
    <AppShell title="Integrations">
      <IntegrationsPage />
    </AppShell>
  );
}