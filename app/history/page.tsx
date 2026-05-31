import { AppShell } from "@/components/app-shell";
import { HistoryPage } from "@/components/history-page";

export default function HistoryRoute() {
  return (
    <AppShell title="History">
      <HistoryPage />
    </AppShell>
  );
}