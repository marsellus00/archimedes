import Link from "next/link";

export function UserSettingsPage() {
  return (
    <div className="space-y-12 p-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-slate-100">
            Account Settings
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
            Manage your personal information, local preferences, and display
            interface to tailor the Architect experience.
          </p>
        </div>

        <Link
          href="/account"
          className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold uppercase text-slate-300 transition hover:bg-white/5"
        >
          Back to Account
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_1fr]">
        <section className="space-y-10">
          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-100">Profile</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                This information will be displayed on your public identity
                across the platform.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium uppercase tracking-widest text-slate-500">
                  Full Name
                </label>
                <input
                  defaultValue="Alexander Thorne"
                  className="mt-2 w-full rounded-xl border-none bg-[#2a2f38] px-6 py-4 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-sky-300/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-widest text-slate-500">
                  Email Address
                </label>
                <input
                  defaultValue="alexander.thorne@architect.dev"
                  className="mt-2 w-full rounded-xl border-none bg-[#2a2f38] px-6 py-4 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-sky-300/20"
                />
              </div>
            </div>
          </section>
        </section>

        <section className="space-y-10">
          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-100">Preferences</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                Control your workspace defaults and local interface behavior.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                ["Theme", "Nocturne"],
                ["Units", "Metric (SI)"],
                ["Workspace Density", "Compact"],
                ["Default Mode", "Think"],
              ].map(([label, value]) => (
                <div key={label}>
                  <label className="text-xs font-medium uppercase tracking-widest text-slate-500">
                    {label}
                  </label>
                  <div className="mt-2 rounded-xl bg-[#2a2f38] px-6 py-4 text-slate-100">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-slate-700/30 pt-8">
        <button
          type="button"
          className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-br from-sky-300 to-cyan-400 px-5 py-3 text-sm font-bold text-[#002c37] shadow-lg shadow-sky-300/10 transition active:scale-95"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}