export function IntegrationsPage() {
  const integrations = [
    {
      name: "Slack",
      status: "Connected",
      description:
        "Sync activity updates and project notifications directly to your channels.",
      action: "Manage Settings",
    },
    {
      name: "GitHub",
      status: "Connected",
      description:
        "Automate deployment pipelines and track repository assets within Architect.",
      action: "Manage Settings",
    },
    {
      name: "Google Drive",
      status: "Not Connected",
      description:
        "Import and export project documentation directly to your cloud storage.",
      action: "Connect App",
    },
    {
      name: "Figma",
      status: "Not Connected",
      description:
        "Embed live design files and sync component libraries to your project assets.",
      action: "Connect App",
    },
  ];

  return (
    <div className="space-y-12 p-8">
      <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-6xl font-extrabold tracking-[-0.04em] text-slate-100">
            Integrations
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
            Connect your workflow with the tools you use every day. Architect
            works seamlessly with your existing stack.
          </p>
        </div>

        <button className="h-fit rounded-xl bg-[#2a2a2a] px-6 py-3 text-sm font-medium text-slate-100 transition hover:bg-[#393939]">
          Request Integration
        </button>
      </header>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((item) => (
          <div
            key={item.name}
            className="group rounded-[2rem] border border-transparent bg-[#1c1b1b] p-8 shadow-[0_40px_60px_-20px_rgba(229,226,225,0.04)] transition-all duration-300 hover:border-slate-700/30 hover:bg-[#201f1f]"
          >
            <div className="mb-12 flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2a2a2a] text-lg font-bold text-sky-300">
                {item.name.slice(0, 1)}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  item.status === "Connected"
                    ? "bg-sky-300/10 text-sky-300"
                    : "bg-[#2a2a2a] text-slate-400"
                }`}
              >
                {item.status}
              </span>
            </div>

            <h3 className="mb-3 text-2xl font-bold text-slate-100">
              {item.name}
            </h3>

            <p className="mb-10 text-sm leading-7 text-slate-400">
              {item.description}
            </p>

            <div className="mt-auto">
              {item.status === "Connected" ? (
                <button className="text-sm font-semibold text-sky-300 hover:underline">
                  {item.action}
                </button>
              ) : (
                <button className="rounded-lg bg-gradient-to-br from-sky-300 to-[#82aaff] px-6 py-2 text-xs font-bold text-[#002e6b] shadow-lg shadow-sky-300/10 transition active:scale-95">
                  {item.action}
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-[#1c1b1b] p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h3 className="mb-4 text-xl font-bold text-slate-100">
              Developer API
            </h3>
            <p className="leading-relaxed text-slate-400">
              Access our API to create custom integrations, automate reporting,
              or build internal dashboards tailored to your organization’s
              needs.
            </p>
          </div>

          <div className="flex gap-6">
            <button className="font-semibold text-sky-300 transition hover:opacity-80">
              Documentation
            </button>
            <button className="font-semibold text-slate-400 transition hover:text-slate-100">
              API Keys
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}