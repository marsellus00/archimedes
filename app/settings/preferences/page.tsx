import { AppShell } from "@/components/app-shell";
import { PreferencesPage } from "@/components/preferences-page";

export default function PreferencesRoute() {
  return (
    <AppShell title="Preferences">
      <PreferencesPage />
    </AppShell>
  );
}