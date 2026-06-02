"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
 BarChart3,
 Bot,
 Calculator,
 ChevronDown,
 ChevronLeft,
 ChevronRight,
 CreditCard,
 Database,
 HelpCircle,
 History,
 Home,
 Puzzle,
 Settings,
 Shield,
 SlidersHorizontal,
 User,
 X,
} from "lucide-react";

type SidebarProps = {
 mobileOpen: boolean;
 setMobileOpen: (open: boolean) => void;
 collapsed: boolean;
 setCollapsed: (collapsed: boolean) => void;
};

type NavChild = {
 label: string;
 href: string;
 icon: React.ComponentType<{ className?: string }>;
};

type NavItem = {
 label: string;
 href: string;
 icon: React.ComponentType<{ className?: string }>;
 children?: NavChild[];
};

const navItems: NavItem[] = [
 { label: "Dashboard", href: "/dashboard", icon: Home },
 { label: "Calculators", href: "/calculators", icon: Calculator },
 { label: "AI Assistant", href: "/assistant", icon: Bot },
 { label: "Data Library", href: "/library", icon: Database },
 { label: "History", href: "/history", icon: History },
 { label: "Analytics", href: "/analytics", icon: BarChart3 },
 {
 label: "Settings",
 href: "/settings/user",
 icon: Settings,
 children: [
 { label: "Profile", href: "/settings/user", icon: User },
 { label: "Preferences", href: "/settings/preferences", icon: SlidersHorizontal },
 { label: "Security", href: "/settings/security", icon: Shield },
 { label: "Integrations", href: "/settings/integrations", icon: Puzzle },
 { label: "Billing", href: "/settings/billing", icon: CreditCard },
 ],
 },
];

const footerItems = [
 { label: "Support", href: "/support", icon: HelpCircle },
 { label: "Account", href: "/account", icon: User },
];

function isActive(pathname: string, href: string) {
 if (href === "/dashboard") return pathname === "/dashboard";
 return pathname === href || pathname.startsWith(`${href}/`);
}

function isSettingsRoute(pathname: string) {
 return pathname.startsWith("/settings");
}

export function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: SidebarProps) {
 const pathname = usePathname();

 const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
 "/settings/user": true,
 });

 const isGroupOpen = (href: string) => {
 if (href === "/settings/user") {
 return isSettingsRoute(pathname) || !!openGroups[href];
 }
 return !!openGroups[href];
 };

 const desktopCollapsed = collapsed;

 return (
 <>
 <div
 className={`fixed inset-0 z-30 bg-black/60 lg:hidden ${
 mobileOpen ? "block" : "hidden"
 }`}
 onClick={() => setMobileOpen(false)}
 />

 <aside
 className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-700/30 bg-[#10141a] text-slate-200 transition-[width,transform] duration-200 ${
 desktopCollapsed ? "lg:w-16" : "lg:w-64"
 } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
 >
 <div className="flex h-full flex-col">
 <div
 className={`flex items-center justify-between gap-2 bg-[#080c12] p-4 ${
 desktopCollapsed ? "lg:px-3" : ""
 }`}
 >
 <div className={`min-w-0 ${desktopCollapsed ? "lg:hidden" : ""}`}>
 <h2 className="truncate text-sm font-bold uppercase tracking-widest text-sky-300">
 SOMATRIX_ENGINE
 </h2>
 <p className="mt-1 truncate text-[10px] uppercase tracking-[0.22em] text-slate-500">
 Engineering Workspace
 </p>
 </div>

 <div className={`hidden ${desktopCollapsed ? "lg:flex" : ""} h-9 w-9 items-center justify-center border border-sky-300/20 bg-sky-300/5 font-mono text-[11px] font-bold text-sky-300`}>
 SE
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setCollapsed(!desktopCollapsed)}
 className="hidden rounded border border-slate-700/40 p-2 text-slate-400 transition hover:border-sky-300/40 hover:text-sky-300 lg:inline-flex"
 aria-label={desktopCollapsed ? "Expand navigation" : "Collapse navigation"}
 title={desktopCollapsed ? "Expand navigation" : "Collapse navigation"}
 >
 {desktopCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
 </button>

 <button
 onClick={() => setMobileOpen(false)}
 className="rounded border border-slate-700/40 p-2 text-slate-400 lg:hidden"
 aria-label="Close navigation"
 >
 <X className="h-4 w-4" />
 </button>
 </div>
 </div>

 <nav className="mt-4 flex-1 overflow-y-auto hide-scrollbar">
 {navItems.map((item) => {
 const Icon = item.icon;
 const hasChildren = !!item.children?.length;
 const active = hasChildren
 ? item.children!.some((child) => isActive(pathname, child.href))
 : isActive(pathname, item.href);

 if (!hasChildren) {
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setMobileOpen(false)}
 title={item.label}
 className={`flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-medium uppercase tracking-tight transition ${
 desktopCollapsed ? "lg:justify-center lg:px-0" : ""
 } ${
 active
 ? "border-l-2 border-sky-300 bg-sky-300/5 text-sky-300"
 : "text-slate-500 hover:bg-white/5 hover:text-sky-300"
 }`}
 >
 <Icon className="h-4 w-4 shrink-0" />
 <span className={desktopCollapsed ? "lg:hidden" : ""}>{item.label}</span>
 </Link>
 );
 }

 const expanded = isGroupOpen(item.href);

 return (
 <div key={item.href}>
 <button
 type="button"
 title={item.label}
 onClick={() => {
 if (desktopCollapsed) return setCollapsed(false);
 setOpenGroups((prev) => ({
 ...prev,
 [item.href]: !expanded,
 }));
 }}
 className={`flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium uppercase tracking-tight transition ${
 desktopCollapsed ? "lg:justify-center lg:px-0" : ""
 } ${
 active
 ? "border-l-2 border-sky-300 bg-sky-300/5 text-sky-300"
 : "text-slate-500 hover:bg-white/5 hover:text-sky-300"
 }`}
 >
 <span className={`flex items-center gap-3 ${desktopCollapsed ? "lg:justify-center" : ""}`}>
 <Icon className="h-4 w-4 shrink-0" />
 <span className={desktopCollapsed ? "lg:hidden" : ""}>{item.label}</span>
 </span>

 <span className={desktopCollapsed ? "lg:hidden" : ""}>
 {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
 </span>
 </button>

 {expanded && (!desktopCollapsed || mobileOpen) ? (
 <div className="ml-6 border-l border-slate-700/20 pl-3">
 {item.children!.map((child) => {
 const ChildIcon = child.icon;
 const childActive = isActive(pathname, child.href);

 return (
 <Link
 key={child.href}
 href={child.href}
 onClick={() => setMobileOpen(false)}
 className={`flex items-center gap-3 px-3 py-2 text-[11px] font-medium uppercase tracking-tight transition ${
 childActive
 ? "text-sky-300"
 : "text-slate-500 hover:text-sky-300"
 }`}
 >
 <ChildIcon className="h-3.5 w-3.5" />
 <span>{child.label}</span>
 </Link>
 );
 })}
 </div>
 ) : null}
 </div>
 );
 })}
 </nav>

 <div className={`border-t border-slate-700/20 px-4 py-4 ${desktopCollapsed ? "lg:px-3" : ""}`}>
 <Link
 href="/calculators"
 onClick={() => setMobileOpen(false)}
 title="New Calculation"
 className={`flex w-full items-center justify-center gap-2 bg-gradient-to-br from-sky-300 to-cyan-400 px-4 py-2.5 text-center text-sm font-bold text-[#002c37] shadow-lg shadow-sky-300/10 transition active:scale-95 ${
 desktopCollapsed ? "lg:px-0" : ""
 }`}
 >
 <Calculator className="h-4 w-4 shrink-0" />
 <span className={desktopCollapsed ? "lg:hidden" : ""}>New Calculation</span>
 </Link>

 <div className="mt-6 space-y-1">
 {footerItems.map((item) => {
 const Icon = item.icon;
 const active = isActive(pathname, item.href);

 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setMobileOpen(false)}
 title={item.label}
 className={`flex items-center gap-2 px-2 py-2 text-xs font-medium transition ${
 desktopCollapsed ? "lg:justify-center lg:px-0" : ""
 } ${active ? "text-sky-300" : "text-slate-400 hover:text-slate-100"}`}
 >
 <Icon className="h-4 w-4 shrink-0" />
 <span className={desktopCollapsed ? "lg:hidden" : ""}>{item.label}</span>
 </Link>
 );
 })}
 </div>
 </div>
 </div>
 </aside>
 </>
 );
}
