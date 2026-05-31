import { AppShell } from "@/components/app-shell";
import { AnalyticsPage } from "@/components/analytics-page";

export default function AnalyticsRoute() {
  return (
    <AppShell title="Analytics">
      <AnalyticsPage />
    </AppShell>
  );
}