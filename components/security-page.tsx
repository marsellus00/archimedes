import { Lock } from "lucide-react";

export function SecurityPage() {
  return (
    <div className="space-y-12 p-8">
      <header className="max-w-4xl">
        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-slate-100">
          Security
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
          Manage your architectural integrity and secure your systemic access.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-12">
          <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Security Health
              </span>
              <span className="text-3xl font-black text-sky-300">94%</span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-[#2a2f38]">
              <div className="h-full w-[94%] bg-gradient-to-r from-sky-300 to-cyan-400" />
            </div>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
              Your account security is exceptional. Consider rotating your
              primary access token for 100%.
            </p>
          </div>

          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-100">
                Password Management
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Update your authentication credentials frequently.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border-none bg-[#2a2f38] p-4 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-sky-300/20"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border-none bg-[#2a2f38] p-4 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-sky-300/20"
                  />
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border-none bg-[#2a2f38] p-4 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-sky-300/20"
                  />
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="space-y-8">
          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-100">
                Active Sessions
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Review devices and environments currently connected to your
                workspace.
              </p>
            </div>

            <div className="space-y-4">
              {[
                ["Ubuntu-24.04 / WSL", "Active now", "Current device"],
                ["Windows Chrome", "2 hours ago", "Port Harcourt"],
                ["VS Code Remote", "Yesterday", "Development node"],
              ].map(([title, time, meta]) => (
                <div
                  key={title}
                  className="flex items-center justify-between rounded-xl border border-slate-700/30 bg-[#10141a] px-5 py-4"
                >
                  <div>
                    <div className="font-semibold text-slate-100">{title}</div>
                    <div className="mt-1 text-xs text-slate-500">{meta}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-sky-300">{time}</div>
                    <button className="mt-1 text-[10px] font-bold uppercase tracking-widest text-rose-400">
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">
                  Two-Factor Authentication
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Strengthen your account access with an additional verification
                  layer.
                </p>
              </div>

              <button className="w-full rounded-xl bg-gradient-to-br from-sky-300 to-cyan-400 px-5 py-3 text-sm font-bold text-[#002c37] shadow-lg shadow-sky-300/10 transition active:scale-95">
                Enable 2FA
              </button>
            </div>
          </section>

          <div className="flex justify-end gap-4 border-t border-slate-700/30 pt-8">
            <button className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5">
              Cancel
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-sky-300 to-cyan-400 px-5 py-3 text-sm font-bold text-[#002c37] shadow-lg shadow-sky-300/10 transition active:scale-95">
              <Lock className="h-4 w-4" />
              Update Security
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}