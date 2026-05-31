import { AppShell } from "@/components/app-shell";
import { AccountPage } from "@/components/account-page";

export default function AccountRoute() {
  return (
    <AppShell title="Account">
      <AccountPage />
    </AppShell>
  );
}