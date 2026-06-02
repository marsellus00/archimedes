"use client";

import { Bell, Download, Menu, Plus, Search, Settings, User } from "lucide-react";

type TopbarProps = {
 title: string;
 setMobileOpen: (open: boolean) => void;
 showActions?: boolean;
};

export function Topbar({ title, setMobileOpen, showActions = true }: TopbarProps) {
 return (
 <header className="sticky top-0 z-30 border-b border-slate-700/30 bg-[#0d1117]/80 backdrop-blur-2xl">
 <div className="flex h-12 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
 <div className="flex min-w-0 items-center gap-3">
 <button
 type="button"
 className="p-1 text-sky-300 transition hover:bg-sky-400/10 lg:hidden"
 onClick={() => setMobileOpen(true)}
 aria-label="Open navigation"
 >
 <Menu className="h-4 w-4" />
 </button>

 <div className="hidden min-w-0 items-center gap-2 text-xs uppercase tracking-tight sm:flex">
 <span className="text-slate-500">SOMATRIX</span>
 <span className="text-slate-500">&gt;</span>
 <span className="truncate font-bold text-sky-300">{title}</span>
 </div>

 <div className="relative hidden md:block">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
 <input
 className="w-56 rounded-full border-none bg-[#1e232b] py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 outline-none ring-1 ring-transparent transition focus:ring-sky-300/40 xl:w-72"
 placeholder="Search workspace..."
 aria-label="Search workspace"
 />
 </div>
 </div>

 <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
 {showActions ? (
 <>
 <button
 type="button"
 className="inline-flex h-9 w-9 items-center justify-center gap-2 border border-sky-300/40 text-[10px] font-bold uppercase text-sky-300 transition hover:bg-sky-300/10 sm:w-auto sm:px-3"
 aria-label="Export"
 title="Export"
 >
 <Download className="h-4 w-4" />
 <span className="hidden sm:inline">Export</span>
 </button>

 <button
 type="button"
 className="inline-flex h-9 w-9 items-center justify-center gap-2 bg-sky-300 text-[10px] font-bold uppercase text-[#003259] transition hover:bg-sky-400 sm:w-auto sm:px-3"
 aria-label="New session"
 title="New session"
 >
 <Plus className="h-4 w-4" />
 <span className="hidden sm:inline">New Session</span>
 </button>
 </>
 ) : null}

 <button
 type="button"
 className="rounded-full p-2 text-slate-500 transition hover:bg-[#1e232b] hover:text-slate-100"
 aria-label="Notifications"
 >
 <Bell className="h-4 w-4" />
 </button>

 <button
 type="button"
 className="rounded-full p-2 text-slate-500 transition hover:bg-[#1e232b] hover:text-slate-100"
 aria-label="Settings"
 >
 <Settings className="h-4 w-4" />
 </button>

 <button
 type="button"
 className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-[#1e232b] text-slate-300 transition hover:text-sky-300"
 aria-label="Account"
 >
 <User className="h-4 w-4" />
 </button>
 </div>
 </div>
 </header>
 );
}
