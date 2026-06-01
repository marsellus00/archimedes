"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

type AppShellProps = {
 title: string;
 children: React.ReactNode;
 showRightRail?: boolean;
 showTopbar?: boolean;
 showTopbarActions?: boolean;
};

export function AppShell({
 title,
 children,
 showRightRail = true,
 showTopbar = true,
 showTopbarActions = true,
}: AppShellProps) {
 const [mobileOpen, setMobileOpen] = useState(false);

 return (
 <div className="min-h-screen bg-[#080c12] text-slate-200 lg:pl-64">
 <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(159,202,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(159,202,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
 <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(159,202,255,0.04)_0%,transparent_70%)]" />

 <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

 <div
 className={
 showRightRail
 ? "relative min-h-screen lg:grid lg:grid-cols-[1fr_320px]"
 : "relative min-h-screen"
 }
 >
 <div className="min-w-0">
 {showTopbar ? (
 <Topbar
 title={title}
 setMobileOpen={setMobileOpen}
 showActions={showTopbarActions}
 />
 ) : (
 <button
 type="button"
 className="fixed left-4 top-4 z-40 border border-sky-300/30 bg-[#0d1117]/90 p-2 text-sky-300 backdrop-blur-xl transition hover:bg-sky-300/10 lg:hidden"
 onClick={() => setMobileOpen(true)}
 aria-label="Open navigation"
 >
 <Menu className="h-4 w-4" />
 <span className="sr-only">Open navigation</span>
 </button>
 )}
 <div className="relative">{children}</div>
 </div>

 {showRightRail ? (
 <aside className="hidden border-l border-slate-700/30 bg-[#181c22] lg:block">
 <div className="hide-scrollbar sticky top-12 h-[calc(100vh-3rem)] overflow-auto p-5">
 <RightRail />
 </div>
 </aside>
 ) : null}
 </div>
 </div>
 );
}
