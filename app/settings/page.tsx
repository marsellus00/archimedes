import { AppShell } from "@/components/app-shell";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function SettingsRoute() {
  return (
    <AppShell title="Settings">
      <PlaceholderPage
        title="Settings"
        copy="A future space for model preferences, solver defaults, units, and user profile controls."
      />
    </AppShell>
  );
}