export function AccountPage() {
  return (
    <div className="space-y-12 p-8">
      <header className="max-w-4xl">
        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-slate-100">
          Account Settings
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
          Manage your personal information and workspace defaults across the platform.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_1fr]">
        {/* LEFT COLUMN */}
        <section className="space-y-10">
          {/* PROFILE */}
          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-100">Profile</h2>
              <p className="mt-2 text-sm text-slate-400">
                This information will be displayed on your public identity.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500">
                  Full Name
                </label>
                <input
                  className="mt-2 w-full rounded-xl bg-[#2a2f38] px-6 py-4 text-slate-100 outline-none"
                  defaultValue="Alexander Thorne"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500">
                  Email Address
                </label>
                <input
                  className="mt-2 w-full rounded-xl bg-[#2a2f38] px-6 py-4 text-slate-100 outline-none"
                  defaultValue="alexander.thorne@architect.dev"
                />
              </div>
            </div>
          </section>

          {/* ACCOUNT PREFERENCES */}
          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-100">Preferences</h2>
              <p className="mt-2 text-sm text-slate-400">
                Control your workspace defaults and interface behavior.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500">
                  Theme
                </label>
                <div className="mt-2 rounded-xl bg-[#2a2f38] px-6 py-4 text-slate-100">
                  Nocturne
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500">
                  Units
                </label>
                <div className="mt-2 rounded-xl bg-[#2a2f38] px-6 py-4 text-slate-100">
                  Metric (SI)
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500">
                  Workspace Density
                </label>
                <div className="mt-2 rounded-xl bg-[#2a2f38] px-6 py-4 text-slate-100">
                  Compact
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-slate-500">
                  Default Mode
                </label>
                <div className="mt-2 rounded-xl bg-[#2a2f38] px-6 py-4 text-slate-100">
                  Think
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* RIGHT COLUMN (OPTIONAL FUTURE SPACE) */}
        <section className="space-y-10">
          <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
              Account Actions
            </h2>

            <div className="space-y-4">
              <button className="w-full rounded-xl bg-[#2a2f38] px-6 py-4 text-left text-slate-300 hover:bg-[#323844]">
                Change Password
              </button>

              <button className="w-full rounded-xl bg-[#2a2f38] px-6 py-4 text-left text-slate-300 hover:bg-[#323844]">
                Manage Sessions
              </button>

              <button className="w-full rounded-xl bg-red-500/10 px-6 py-4 text-left text-red-400 hover:bg-red-500/20">
                Delete Account
              </button>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}