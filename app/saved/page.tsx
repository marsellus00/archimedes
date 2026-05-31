import { AppShell } from "@/components/app-shell";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function SavedRoute() {
  return (
    <AppShell title="Saved Work">
      <PlaceholderPage
        title="Saved Work"
        copy="A future space for stored engineering sessions, reports, and reusable calculator presets."
      />
    </AppShell>
  );
}