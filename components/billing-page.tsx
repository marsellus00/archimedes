export function BillingPage() {
  const paymentMethods = [
    {
      title: "Visa ending in 4421",
      subtitle: "Expires 12/26 • Primary",
      icon: "credit_card",
    },
    {
      title: "Apple Pay",
      subtitle: "Connected via iCloud",
      icon: "payments",
    },
  ];

  const invoices = [
    ["OCT 14, 2023", "INV-2023-0892", "Architect Pro Subscription", "$49.00"],
    ["SEP 14, 2023", "INV-2023-0841", "Architect Pro Subscription", "$49.00"],
    ["AUG 14, 2023", "INV-2023-0798", "Architect Pro Subscription", "$49.00"],
  ];

  return (
    <div className="space-y-12 p-8">
      <header className="max-w-4xl">
        <h1 className="mb-4 text-6xl font-extrabold tracking-tighter text-slate-100">
          Billing
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
          Manage your subscriptions, professional licensing, and payment
          instrumentation across the Architect ecosystem.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-12">
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-widest text-slate-500">
              Current Plan
            </h3>

            <div className="relative overflow-hidden rounded-2xl bg-[#201f1f] p-8 shadow-[0_40px_60px_-20px_rgba(229,226,225,0.04)]">
              <div className="absolute right-0 top-0 p-6">
                <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-300">
                  Active
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-4xl font-bold text-slate-100">
                    Architect Pro
                  </h4>
                  <p className="mt-2 text-slate-400">
                    Professional tools for independent creators.
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-slate-100">$49</span>
                  <span className="font-medium text-slate-400">/ month</span>
                </div>

                <ul className="space-y-3 text-sm text-slate-400">
                  <li>Unlimited high-fidelity renders</li>
                  <li>1TB Secure Cloud Storage</li>
                  <li>Priority GPU queuing</li>
                </ul>

                <button className="w-full rounded-xl bg-gradient-to-br from-sky-300 to-[#82aaff] px-6 py-4 font-bold text-[#002e6b] shadow-[0_10px_30px_rgba(174,198,255,0.2)] transition hover:brightness-110">
                  Upgrade to Enterprise
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-end justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Payment Methods
              </h3>
              <button className="text-sm font-medium text-sky-300 transition hover:text-slate-100">
                Add New Card
              </button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-2xl bg-[#2a2a2a] p-6 transition hover:bg-[#393939]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-[#353534] text-slate-400">
                      {item.icon === "credit_card" ? "💳" : ""}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-slate-500">•••</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Billing History
          </h3>

          <div className="space-y-6 rounded-2xl bg-[#161b22] p-8">
            {invoices.map(([date, invoice, description, amount]) => (
              <div
                key={invoice}
                className="group flex items-center justify-between border-b border-slate-700/20 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-6">
                  <div className="font-mono text-sm text-slate-400">{date}</div>
                  <div>
                    <p className="font-medium text-slate-100 transition group-hover:text-sky-300">
                      {invoice}
                    </p>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <span className="font-semibold text-slate-100">{amount}</span>
                  <button className="rounded-full p-2 text-slate-400 transition hover:bg-[#2a2a2a]">
                    ↓
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <button className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-300 transition hover:opacity-80">
                View all past invoices
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}