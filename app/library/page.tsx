import { AppShell } from "@/components/app-shell";
import { LibraryPage } from "@/components/library-page";

export default function LibraryRoute() {
  return (
    <AppShell title="Data Library">
      <LibraryPage />
    </AppShell>
  );
}