import {
  Activity,
  BarChart3,
  BrainCircuit,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const quickStats = [
  { label: "Base Prompt", value: "Loaded", tone: "text-sky-300" },
  { label: "Scope Gate", value: "Ready", tone: "text-cyan-300" },
  { label: "AI Provider", value: "Pending", tone: "text-amber-300" },
  { label: "Persistence", value: "Pending", tone: "text-violet-300" },
];

const recentActivity = [
  {
    title: "Pipe Flow Analysis completed",
    meta: "2 mins ago",
    icon: Activity,
  },
  {
    title: "Analytics report exported",
    meta: "18 mins ago",
    icon: BarChart3,
  },
  {
    title: "Material profile updated",
    meta: "42 mins ago",
    icon: Database,
  },
];

export function RightRail() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              AI Context
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-100">
              Engineering Assistant
            </h3>
          </div>

          <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-sky-300">
            Phase_2
          </span>
        </div>

        <div className="rounded-xl border border-sky-300/20 bg-sky-300/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-300" />
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-300">
              Contract Preview
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Base.txt enforcement, request classification, provider selection, and response metadata validation are prepared. Live AI is opt-in; database, auth, retrieval, and solver integrations remain pending.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-5">
        <div className="mb-4 flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-sky-300" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Quick Variables
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-700/20 bg-[#10141a] px-3 py-3"
            >
              <div className="text-[10px] uppercase tracking-widest text-slate-500">
                {item.label}
              </div>
              <div className={`mt-2 text-sm font-bold ${item.tone}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-cyan-300" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Recent Activity
          </h3>
        </div>

        <div className="space-y-3">
          {recentActivity.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-700/20 bg-[#10141a] px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 text-sky-300" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-200">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.meta}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Next Build Step
          </h3>
        </div>

        <p className="text-sm leading-6 text-slate-300">
          Continue porting remaining legacy screens into this dark system and
          extract shared panels only after the layouts stabilize.
        </p>

        <Link
          href="/assistant"
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-300 transition hover:gap-3"
        >
          Open AI Workspace
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}