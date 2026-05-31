import { AppShell } from "@/components/app-shell";
import { UserSettingsPage } from "@/components/user-settings-page";

export default function UserSettingsRoute() {
  return (
    <AppShell title="User Settings">
      <UserSettingsPage />
    </AppShell>
  );
}