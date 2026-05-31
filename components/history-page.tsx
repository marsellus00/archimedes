import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ShieldCheck,
} from "lucide-react";

const logRows = [
  {
    id: "RUN-1042",
    activity: "Calculation Run",
    project: "Pipe Flow Analysis",
    user: "Julian Thorne",
    status: "Success",
    time: "2 mins ago",
  },
  {
    id: "RUN-1041",
    activity: "Model Export",
    project: "Turbulence Study",
    user: "Alex Mercer",
    status: "Success",
    time: "14 mins ago",
  },
  {
    id: "RUN-1040",
    activity: "API Synchronize",
    project: "Pressure Network",
    user: "System",
    status: "Pending",
    time: "22 mins ago",
  },
  {
    id: "RUN-1039",
    activity: "Calculation Run",
    project: "Valve Loss Check",
    user: "Julian Thorne",
    status: "Failed",
    time: "51 mins ago",
  },
];

const timeline = [
  {
    title: "Pipe Flow Analysis executed",
    meta: "RUN-1042 • Solver v2.8",
    time: "2m ago",
    tone: "border-sky-300 text-sky-300",
  },
  {
    title: "Exported turbulence results",
    meta: "PDF + CSV bundle",
    time: "14m ago",
    tone: "border-emerald-400 text-emerald-400",
  },
  {
    title: "Sync queued for external node",
    meta: "Awaiting confirmation",
    time: "22m ago",
    tone: "border-amber-300 text-amber-300",
  },
  {
    title: "Valve loss simulation failed",
    meta: "Input validation issue",
    time: "51m ago",
    tone: "border-rose-400 text-rose-400",
  },
];

function statusClasses(status: string) {
  if (status === "Success") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-400";
  }
  if (status === "Pending") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-300";
  }
  return "border-rose-400/30 bg-rose-400/10 text-rose-400";
}

export function HistoryPage() {
  return (
    <div className="space-y-8 p-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-slate-100">
            History
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-400">
            Complete chronological record of operations, calculation runs,
            exports, and sync activity across your engineering workspace.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-700/30 bg-[#161b22] px-4 py-3">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-tight text-slate-500">
              Total Runs
            </p>
            <p className="text-lg font-black text-slate-100">1,429</p>
          </div>
          <div className="h-8 w-px bg-slate-700/30" />
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-tight text-slate-500">
              Success Rate
            </p>
            <p className="text-lg font-black text-sky-300">99.2%</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-700/30 bg-[#161b22] p-2 md:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#10141a] px-4 py-3">
          <Activity className="h-4 w-4 text-slate-500" />
          <select className="w-full bg-transparent text-sm text-slate-200 outline-none">
            <option>All Statuses</option>
          </select>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-[#10141a] px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-slate-500" />
          <select className="w-full bg-transparent text-sm text-slate-200 outline-none">
            <option>All Activities</option>
          </select>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-[#10141a] px-4 py-3 md:col-span-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-200">
            Oct 12, 2023 — Oct 19, 2023
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button className="rounded p-1 transition hover:bg-white/5">
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            </button>
            <button className="rounded p-1 transition hover:bg-white/5">
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-700/30 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Activity Log Table
              </h2>
              <p className="text-xs text-slate-500">
                Recent system and user operations
              </p>
            </div>
            <button className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-300">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#10141a]">
                <tr>
                  {["Run ID", "Activity", "Project", "User", "Status", "Time"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {logRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-700/20 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-sky-300">
                      {row.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      {row.activity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {row.project}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {row.user}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusClasses(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {row.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-100">
              Event Timeline
            </h3>
            <div className="space-y-5 border-l border-slate-700/30 pl-5">
              {timeline.map((item) => (
                <div key={item.title} className="relative">
                  <div
                    className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 bg-[#10141a] ${item.tone}`}
                  />
                  <div className="text-sm font-semibold text-slate-200">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.meta}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}