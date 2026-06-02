"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
 Activity,
 BarChart3,
 Bot,
 Cpu,
 FileText,
 Flame,
 History,
 Layers3,
 Plus,
 Sigma,
 Waves,
 Database,
} from "lucide-react";


type DashboardApiResponse = {
 status?: string;
 project?: { id: string; name: string; discipline?: string; role?: string };
 dashboard?: {
 counts: {
 calculations: number;
 chats: number;
 uploadedFiles: number;
 safetyCriticalItems: number;
 };
 } | null;
 message?: string;
};

const recentlyUsed = [
 {
 title: "Fluid Dynamics",
 subtitle: "Pipe pressure drop module",
 meta: "Engine active",
 badge: "Active",
 icon: Waves,
 tone: "text-cyan-300",
 href: "/calculators/fluid-dynamics",
 },
 {
 title: "Column Buckling",
 subtitle: "Euler buckling screen",
 meta: "Engine active",
 badge: "Review",
 icon: Layers3,
 tone: "text-sky-300",
 href: "/calculators/column-buckling",
 },
 {
 title: "Thermal Transfer",
 subtitle: "Conduction estimator",
 meta: "Engine active",
 badge: "Active",
 icon: Flame,
 tone: "text-amber-300",
 href: "/calculators/thermal-transfer",
 },
];

const suggestedTools = [
 {
 title: "Fatigue Life Estimator",
 subtitle: "Cyclic loading predictions",
 icon: Activity,
 },
 {
 title: "Material Selector",
 subtitle: "Compare Ti-6Al-4V vs Composites",
 icon: Layers3,
 },
];

const quickModules = [
 { title: "Math Parser", icon: Sigma },
 { title: "Unit Converter", icon: BarChart3 },
 { title: "Python Console", icon: Cpu },
 { title: "Spec Sheet", icon: FileText },
];

const chartBars = [
 "h-1/2",
 "h-2/3",
 "h-1/3",
 "h-3/4",
 "h-full",
 "h-1/2",
 "h-1/4",
 "h-1/3",
 "h-2/3",
 "h-1/2",
 "h-3/4",
 "h-1/4",
];

export function DashboardPage() {
 const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null);

 useEffect(() => {
 let ignore = false;

 async function loadDashboard() {
 try {
 const response = await fetch("/api/dashboard", {
 headers: {
 "x-engineering-user-id": "dashboard-local-user",
 "x-engineering-user-email": "dashboard-local-user@engineering.local",
 "x-engineering-user-name": "Dashboard Local User",
 },
 });
 const data = (await response.json()) as DashboardApiResponse;
 if (!ignore) setDashboardData(data);
 } catch {
 if (!ignore) {
 setDashboardData({
 status: "dashboard_unavailable",
 message: "Dashboard API could not be reached.",
 });
 }
 }
 }

 loadDashboard();

 return () => {
 ignore = true;
 };
 }, []);

 const liveCounts = dashboardData?.dashboard?.counts;

 return (
 <div className="space-y-10 p-8">
 <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
 <div>
 <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1">
 <span className="relative flex h-2 w-2">
 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
 <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
 </span>
 <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
 Database Integrated
 </span>
 </div>

 <h1 className="mb-2 max-w-4xl text-5xl font-bold tracking-tight text-slate-100">
 Engineering Intelligence Platform
 </h1>
 {dashboardData?.message ? (
 <p className="mt-3 max-w-2xl rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-sm text-amber-200">
 {dashboardData.message}
 </p>
 ) : null}
 </div>

 <div className="flex gap-3">
 <Link
 href="/calculators"
 className="inline-flex items-center gap-2 rounded-xl bg-sky-300 px-6 py-3 text-sm font-bold text-[#003259] shadow-lg shadow-sky-300/20 transition hover:bg-sky-400"
 >
 <Plus className="h-4 w-4" />
 Start Calculation
 </Link>

 <Link
 href="/assistant"
 className="inline-flex items-center gap-2 rounded-xl border border-slate-700/40 bg-[#161b22] px-6 py-3 text-sm font-bold text-sky-300 transition hover:bg-[#1b2129]"
 >
 <Bot className="h-4 w-4" />
 Open Assistant
 </Link>
 </div>
 </section>

 <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
 {[
 ["Saved calculations", liveCounts?.calculations ?? 0],
 ["Chat sessions", liveCounts?.chats ?? 0],
 ["Uploaded files", liveCounts?.uploadedFiles ?? 0],
 ["Review flags", liveCounts?.safetyCriticalItems ?? 0],
 ].map(([label, value]) => (
 <div key={label} className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-5">
 <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
 <Database className="h-4 w-4 text-sky-300" />
 {label}
 </div>
 <div className="text-3xl font-bold text-slate-100">{value}</div>
 <div className="mt-2 text-xs text-slate-500">
 {dashboardData?.project?.name ?? "Default project when database is configured"}
 </div>
 </div>
 ))}
 </section>

 <div className="grid grid-cols-12 gap-6">
 <div className="col-span-12 rounded-2xl border border-slate-700/30 bg-[#161b22] p-6 lg:col-span-8">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
 <History className="h-5 w-5 text-sky-300" />
 Recently Used Calculators
 </h2>

 <Link
 href="/calculators"
 className="text-xs font-bold uppercase tracking-wider text-sky-300"
 >
 View All
 </Link>
 </div>

 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
 {recentlyUsed.map((item) => {
 const Icon = item.icon;

 return (
 <Link
 key={item.title}
 href={item.href}
 className="group rounded-xl border border-slate-700/20 bg-[#10141a] p-4 transition hover:border-sky-300/30 hover:bg-[#1b2129]"
 >
 <Icon className={`mb-3 h-6 w-6 ${item.tone}`} />

 <div className="mb-1 text-sm font-bold text-slate-100">
 {item.title}
 </div>
 <div className="mb-4 text-[10px] text-slate-500">
 {item.subtitle}
 </div>

 <div className="flex items-center justify-between text-[10px]">
 <span className="text-slate-500">{item.meta}</span>
 <span className="rounded bg-sky-300/10 px-1.5 py-0.5 text-sky-300">
 {item.badge}
 </span>
 </div>
 </Link>
 );
 })}
 </div>
 </div>

 <div className="col-span-12 rounded-2xl border border-slate-700/30 bg-[#161b22]/80 p-6 backdrop-blur-sm lg:col-span-4">
 <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
 <Activity className="h-5 w-5 text-cyan-300" />
 AI-Suggested Tools
 </h2>

 <p className="mb-6 text-xs leading-relaxed text-slate-400">
 Based on your &quot;Project Orion&quot; structural data, we
 recommend:
 </p>

 <ul className="space-y-4">
 {suggestedTools.map((tool) => {
 const Icon = tool.icon;

 return (
 <li
 key={tool.title}
 className="group flex cursor-pointer items-center gap-4"
 >
 <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/20 bg-[#10141a]">
 <Icon className="h-5 w-5 text-sky-300 transition group-hover:scale-110" />
 </div>

 <div>
 <div className="text-xs font-bold text-slate-100">
 {tool.title}
 </div>
 <div className="text-[10px] text-slate-500">
 {tool.subtitle}
 </div>
 </div>
 </li>
 );
 })}
 </ul>
 </div>

 <div className="col-span-12 rounded-2xl border border-slate-700/30 bg-[#161b22] p-6 lg:col-span-5">
 <h2 className="mb-6 text-lg font-semibold text-slate-100">
 Quick Access Modules
 </h2>

 <div className="grid grid-cols-2 gap-4">
 {quickModules.map((module) => {
 const Icon = module.icon;

 return (
 <button
 key={module.title}
 className="flex items-center rounded-lg border border-slate-700/20 bg-[#10141a] p-3 text-left transition hover:border-sky-300/30 hover:bg-[#1b2129]"
 >
 <Icon className="mr-3 h-5 w-5 text-cyan-300" />
 <span className="text-xs font-medium text-slate-200">
 {module.title}
 </span>
 </button>
 );
 })}
 </div>
 </div>

 <div className="relative col-span-12 overflow-hidden rounded-2xl border border-slate-700/30 bg-[#132034] p-6 text-white lg:col-span-7">
 <div className="relative z-10">
 <div className="mb-8 flex items-start justify-between">
 <div>
 <h2 className="text-lg font-semibold">Computation Cycles</h2>
 <p className="text-[10px] uppercase tracking-widest text-white/60">
 Real-time Cluster Utilization
 </p>
 </div>

 <div className="text-2xl font-bold">
 482.4 <span className="text-xs opacity-60">GFlops</span>
 </div>
 </div>

 <div className="flex h-24 items-end gap-1.5">
 {chartBars.map((height, index) => (
 <div
 key={index}
 className={[
 "flex-1 rounded-t-sm",
 height,
 index === 4
 ? "bg-cyan-400 shadow-[0_-4px_12px_rgba(0,218,243,0.3)]"
 : index % 3 === 0
 ? "bg-white/35"
 : index % 2 === 0
 ? "bg-white/20"
 : "bg-white/28",
 ].join(" ")}
 />
 ))}
 </div>
 </div>

 <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
 </div>

 <div className="col-span-12 rounded-2xl border border-slate-700/30 bg-[#161b22] p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
 System overview
 </p>
 <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-100">
 Workspace navigation
 </h3>
 </div>
 </div>

 <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
 {[
 ["Dashboard", "Landing space for recent work and launch actions."],
 ["Calculators", "Interactive engineering forms and result cards."],
 ["AI Assistant", "Reasoning workspace for guided engineering output."],
 ["Data Library", "Reference properties, constants, and materials."],
 ].map(([name, description]) => (
 <div
 key={name}
 className="rounded-xl border border-slate-700/20 bg-[#10141a] p-4"
 >
 <div className="text-sm font-semibold text-slate-100">{name}</div>
 <div className="mt-2 text-sm leading-6 text-slate-400">
 {description}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}