export function PreferencesPage() {
  return (
    <div className="space-y-12 p-8">
      <header className="max-w-4xl">
        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-slate-100">
          Preferences
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
          Configure your workspace environment. These settings are synchronized
          across all Architect instances.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_1fr]">
        <section className="space-y-10">
          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-100">
                Regional Settings
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                Localization and time synchronisation for global collaboration.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Language
                </label>
                <select className="w-full rounded-xl border-none bg-[#2a2f38] px-6 py-4 text-slate-100 outline-none">
                  <option>English (US)</option>
                  <option>Deutsch</option>
                  <option>日本語</option>
                  <option>Français</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Timezone
                </label>
                <select className="w-full rounded-xl border-none bg-[#2a2f38] px-6 py-4 text-slate-100 outline-none">
                  <option>(GMT-08:00) Pacific Time (US &amp; Canada)</option>
                  <option>(GMT+00:00) UTC</option>
                  <option>(GMT+01:00) Central European Time</option>
                  <option>(GMT+09:00) Tokyo</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-100">
                Unit System
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                Measurement standards for architectural renders and blueprints.
              </p>
            </div>

            <div className="inline-flex w-full max-w-md rounded-xl bg-[#1c1b1b] p-1.5">
              <button className="flex-1 rounded-lg bg-[#2a2f38] px-6 py-3 text-sm font-bold text-sky-300 shadow-lg">
                Metric (SI)
              </button>
              <button className="flex-1 rounded-lg px-6 py-3 text-sm font-bold text-slate-400">
                Imperial
              </button>
            </div>
          </section>
        </section>

        <section className="space-y-10">
          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-100">
                Display
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                Visual aesthetics and interface scaling for high-density
                monitors.
              </p>
            </div>

            <div className="space-y-12">
              <div className="flex items-center justify-between rounded-xl bg-[#1c1b1b] p-6">
                <div>
                  <h3 className="font-bold text-slate-100">Nocturne Mode</h3>
                  <p className="text-sm text-slate-400">
                    Enhanced low-light interface optimization
                  </p>
                </div>
                <button className="relative h-8 w-14 rounded-full bg-sky-300">
                  <span className="absolute right-1 top-1 h-6 w-6 rounded-full bg-[#002e6b]" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Interface Scale
                  </label>
                  <span className="text-sm font-mono text-sky-300">
                    100% (Compact)
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="120"
                  defaultValue="100"
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                  <span>Compact</span>
                  <span>Spacious</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Accent Color
                </label>
                <div className="flex gap-4">
                  <button className="h-10 w-10 rounded-full border-4 border-slate-100 bg-sky-300 shadow-[0_0_20px_rgba(174,198,255,0.3)]" />
                  <button className="h-10 w-10 rounded-full bg-amber-400 transition hover:scale-110" />
                  <button className="h-10 w-10 rounded-full bg-rose-300 transition hover:scale-110" />
                  <button className="h-10 w-10 rounded-full bg-slate-700 transition hover:scale-110" />
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-slate-600 text-slate-400 transition hover:border-sky-300">
                    +
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-100">
                Performance
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                Optimise engine resources and hardware utilization.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/20 py-6">
                <div>
                  <h3 className="font-bold text-slate-100">Motion Quality</h3>
                  <p className="text-sm text-slate-400">
                    Enable buttery-smooth 120Hz interface transitions
                  </p>
                </div>
                <button className="relative h-8 w-14 rounded-full bg-[#2a2f38]">
                  <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-slate-500" />
                </button>
              </div>

              <div className="flex items-center justify-between py-6">
                <div>
                  <h3 className="font-bold text-slate-100">
                    Hardware Acceleration
                  </h3>
                  <p className="text-sm text-slate-400">
                    Offload complex rendering tasks to the dedicated GPU
                  </p>
                </div>
                <button className="relative h-8 w-14 rounded-full bg-sky-300">
                  <span className="absolute right-1 top-1 h-6 w-6 rounded-full bg-[#002e6b]" />
                </button>
              </div>
            </div>
          </section>
        </section>
      </div>

      <div className="flex items-center justify-end gap-6 border-t border-slate-700/20 pt-12">
        <button className="px-8 py-3 text-sm font-bold text-slate-400 transition hover:text-slate-100">
          Discard Changes
        </button>
        <button className="rounded-xl bg-gradient-to-br from-sky-300 to-[#82aaff] px-10 py-3 font-bold text-[#002e6b] shadow-[0_10px_30px_rgba(174,198,255,0.2)] transition hover:scale-[1.02] active:scale-95">
          Apply System Preferences
        </button>
      </div>
    </div>
  );
}