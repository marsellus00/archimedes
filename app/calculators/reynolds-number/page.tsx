import { AppShell } from "@/components/app-shell";
import { ReynoldsNumberPage } from "@/components/reynolds-number-page";

export default function ReynoldsNumberRoute() {
  return (
    <AppShell title="Reynolds Number">
      <ReynoldsNumberPage />
    </AppShell>
  );
}
