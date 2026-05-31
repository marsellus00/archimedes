import {
  Activity,
  Database,
  Timer,
  TrendingUp,
} from "lucide-react";

const metrics = [
  {
    title: "Total Calculations",
    value: "1,284,032",
    sub: "+12.4% from last month",
    icon: Activity,
    tone: "text-sky-300 bg-sky-300/10",
  },
  {
    title: "Avg Processing Time",
    value: "248ms",
    sub: "99.9th percentile optimization",
    icon: Timer,
    tone: "text-cyan-300 bg-cyan-300/10",
  },
  {
    title: "Storage Used",
    value: "4.2 TB",
    sub: "65% of available node capacity",
    icon: Database,
    tone: "text-violet-300 bg-violet-300/10",
  },
  {
    title: "Active Simulations",
    value: "87",
    sub: "Across 14 compute nodes",
    icon: TrendingUp,
    tone: "text-emerald-400 bg-emerald-400/10",
  },
];

const barHeights = [
  "h-24",
  "h-32",
  "h-20",
  "h-36",
  "h-44",
  "h-28",
  "h-16",
  "h-24",
  "h-36",
  "h-28",
  "h-40",
  "h-20",
];

export function AnalyticsPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            System Performance
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time resource allocation and architectural simulation metrics.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="rounded bg-[#1e232b] px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-[#2a313a]">
            Export Report
          </button>
          <button className="rounded bg-sky-300 px-4 py-2 text-sm font-bold text-[#002c37] shadow-lg shadow-sky-300/20 transition hover:brightness-110">
            Live View
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-xl border border-slate-700/30 bg-[#161b22] p-6 transition hover:bg-[#1b2129]"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {item.title}
                </span>
                <div className={`rounded p-2 ${item.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-6">
                <div className="text-3xl font-bold text-slate-100">
                  {item.value}
                </div>
                <div className="mt-2 text-xs text-sky-300">{item.sub}</div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-xl border border-slate-700/30 bg-[#161b22] p-6">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Computation Cycles
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Real-time Cluster Utilization
              </p>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              482.4 <span className="text-xs text-slate-500">GFlops</span>
            </div>
          </div>

          <div className="flex h-52 items-end gap-2">
            {barHeights.map((height, index) => (
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

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700/30 bg-[#161b22] p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-100">
              Efficiency Snapshot
            </h2>
            <div className="space-y-4">
              {[
                ["Node Availability", "97.8%"],
                ["Cache Hit Rate", "88.4%"],
                ["Queued Jobs", "124"],
                ["Failed Jobs", "6"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg bg-[#10141a] px-4 py-3"
                >
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="font-mono text-sm font-bold text-sky-300">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/30 bg-[#161b22] p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-100">
              Throughput
            </h2>
            <div className="space-y-4">
              {[
                ["Simulation Load", "74%"],
                ["GPU Utilization", "61%"],
                ["Storage Throughput", "49%"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-bold text-cyan-300">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#10141a]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-300 to-cyan-400"
                      style={{ width: value }}
                    />
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