import Link from "next/link";
import { ArrowRight, Beaker, Plus } from "lucide-react";
import { calculatorCatalog, calculatorCategories } from "@/data/calculatorCatalog";

export function CalculatorsPage() {
  return (
    <div className="space-y-10 p-8">
      <header className="max-w-4xl">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-sky-300">
          Phase 4 Engineering Modules
        </p>
        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-slate-100">
          Calculators
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-slate-400">
          Select a deterministic engineering calculator. Each active module uses shared
          calculation logic, input validation, formula traces, assumptions, warnings,
          limitations, and professional-review boundaries where required.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-700/30 bg-[#161b22]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <aside className="border-b border-slate-700/30 bg-[#10141a] p-6 lg:col-span-3 lg:border-b-0 lg:border-r">
            <h3 className="mb-6 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Active Categories
            </h3>

            <div className="space-y-2">
              {calculatorCategories.map((category) => {
                const Icon = category.icon;
                const count = calculatorCatalog.filter((tool) => tool.category === category.label).length;

                return (
                  <div
                    key={category.label}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-slate-400"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-sky-300" />
                      {category.label}
                    </span>
                    <span className="rounded bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] text-sky-300">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Engine Status
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                All listed calculators route to implemented Phase 4 pages and deterministic API endpoints.
              </p>
            </div>
          </aside>

          <main className="p-6 lg:col-span-9 lg:p-10">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-100">
                  Calculation Modules
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  No calculator cards link to placeholders. Unbuilt future modules are shown separately.
                </p>
              </div>

              <Link
                href="/api/calculations"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:underline"
              >
                View calculation API index
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {calculatorCatalog.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="group rounded-2xl border border-slate-700/20 bg-[#10141a] p-6 transition hover:border-sky-300/30 hover:bg-[#1b2129]"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-300/10 text-sky-300 transition group-hover:bg-sky-300 group-hover:text-[#002c37]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded bg-emerald-300/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                        {tool.status}
                      </span>
                    </div>
                    <h4 className="mb-2 font-bold text-slate-100">{tool.title}</h4>
                    <p className="min-h-20 text-sm leading-6 text-slate-400">{tool.description}</p>
                    <div className="mt-5 truncate border-t border-slate-800 pt-3 font-mono text-[10px] text-slate-500">
                      {tool.endpoint}
                    </div>
                  </Link>
                );
              })}

              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/40 bg-[#10141a] p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1b2129] text-slate-400">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  Future custom modules remain disabled until scoped and reviewed.
                </span>
              </div>
            </div>
          </main>
        </div>

        <div className="flex flex-col gap-6 border-t border-slate-700/30 bg-sky-300/10 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-300 text-[#002c37]">
              <Beaker className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-sky-300">
                Phase 4 Updated
              </span>
              <span className="font-bold text-slate-100">
                Calculation pages now consume deterministic modules instead of placeholder links.
              </span>
            </div>
          </div>

          <Link
            href="/calculators/fluid-dynamics"
            className="rounded-xl bg-sky-300 px-6 py-3 text-sm font-bold text-[#002c37]"
          >
            Launch Fluid Calculator
          </Link>
        </div>
      </section>
    </div>
  );
}
