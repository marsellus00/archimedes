import { AppShell } from "@/components/app-shell";
import { AssistantPage } from "@/components/assistant-page";

export default function AssistantRoute() {
 return (
 <AppShell
 title="AI Assistant"
 showRightRail={false}
 showTopbar={false}
 showTopbarActions={false}
 >
 <AssistantPage />
 </AppShell>
 );
}
