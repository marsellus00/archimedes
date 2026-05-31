import { AppShell } from "@/components/app-shell";
import { BillingPage } from "@/components/billing-page";

export default function BillingRoute() {
  return (
    <AppShell title="Billing">
      <BillingPage />
    </AppShell>
  );
}