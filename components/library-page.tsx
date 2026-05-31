import {
  Beaker,
  Database,
  Filter,
  Plus,
  Star,
} from "lucide-react";

const materials = [
  {
    name: "Titanium Ti-6Al-4V",
    grade: "Grade 5 Annealed",
    modulus: "113.8",
    poisson: "0.342",
    density: "4,430",
    expansion: "8.6",
    accent: "bg-sky-300",
    starred: false,
  },
  {
    name: "Aluminum 7075-T6",
    grade: "Aerospace Grade",
    modulus: "71.7",
    poisson: "0.330",
    density: "2,810",
    expansion: "23.4",
    accent: "bg-cyan-400",
    starred: true,
  },
  {
    name: "Inconel 718",
    grade: "Nickel-Chromium Alloy",
    modulus: "200.0",
    poisson: "0.290",
    density: "8,190",
    expansion: "13.0",
    accent: "bg-slate-400",
    starred: false,
  },
  {
    name: "CFRP (Toray M40J)",
    grade: "Quasi-Isotropic Laminate",
    modulus: "58.0",
    poisson: "0.310",
    density: "1,550",
    expansion: "-0.5",
    accent: "bg-emerald-400",
    starred: true,
  },
  {
    name: "Stainless Steel 316",
    grade: "Austenitic",
    modulus: "193.0",
    poisson: "0.300",
    density: "8,000",
    expansion: "16.0",
    accent: "bg-amber-400",
    starred: false,
  },
];

export function LibraryPage() {
  return (
    <div className="space-y-10 p-8">
      <header className="max-w-4xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/5 px-3 py-1">
          <Database className="h-3.5 w-3.5 text-sky-300" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-sky-300">
            Engineering Data
          </span>
        </div>

        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-slate-100">
          Data Library
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
          Access aerospace-grade materials, cryogenic fluids, and physical constants for high-precision simulations.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-4">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["Materials", "Fluids", "Constants"].map((tab, index) => (
              <button
                key={tab}
                className={
                  index === 0
                    ? "rounded-xl bg-sky-300 px-6 py-2 text-sm font-bold text-[#002c37]"
                    : "rounded-xl bg-[#10141a] px-6 py-2 text-sm font-medium text-slate-400 hover:text-sky-300"
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <Filter className="h-4 w-4" />
              Filter By:
              <select className="bg-transparent font-bold text-sky-300 outline-none">
                <option>Aerospace Alloys</option>
                <option>Polymers</option>
                <option>Ceramics</option>
                <option>Composites</option>
              </select>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl bg-sky-300 px-4 py-2 text-xs font-bold text-[#002c37]">
              <Plus className="h-4 w-4" />
              Custom Material
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700/20">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#10141a]">
                <tr>
                  {[
                    "Material Name",
                    "Young's Modulus (GPa)",
                    "Poisson's Ratio",
                    "Density (kg/m³)",
                    "Thermal Expansion (µm/m·K)",
                    "",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {materials.map((material) => (
                  <tr
                    key={material.name}
                    className="group border-t border-slate-700/20 transition hover:bg-sky-300/[0.03]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`mr-4 h-8 w-2 rounded-full ${material.accent}`} />
                        <div>
                          <p className="font-bold text-slate-100">{material.name}</p>
                          <p className="font-mono text-[10px] text-slate-500">
                            {material.grade}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-300">
                      {material.modulus}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-sky-300">
                      {material.poisson}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-300">
                      {material.density}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-300">
                      {material.expansion}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Star
                        className={`h-4 w-4 ${
                          material.starred
                            ? "fill-sky-300 text-sky-300"
                            : "text-slate-600 group-hover:text-sky-300"
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-[#132034] to-[#0a0e14] p-8">
          <div className="relative z-10 max-w-xl">
            <h3 className="mb-2 text-2xl font-bold text-slate-100">
              Material Comparison Tool
            </h3>
            <p className="mb-6 text-sm leading-7 text-slate-400">
              Compare stress-strain curves and failure envelopes across your selected materials library.
            </p>
            <button className="rounded-xl bg-sky-300 px-6 py-3 text-xs font-black uppercase tracking-widest text-[#002c37]">
              Launch Comparative Analysis
            </button>
          </div>

          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-sky-300/10 blur-[100px]" />
        </div>

        <div className="rounded-2xl border border-sky-300/20 bg-[#161b22] p-6">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-sky-300">
            Active Formula
          </p>

          <div className="rounded-xl bg-[#10141a] p-4">
            <p className="font-mono text-sm font-bold text-sky-300">σ = E × ε</p>
            <p className="mt-2 text-[10px] text-slate-500">
              Hooke&apos;s Law: Linear Elasticity
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">E (Modulus)</span>
              <span className="font-bold text-slate-100">113.8 GPa</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Strain (ε)</span>
              <span className="font-bold text-sky-300">0.002</span>
            </div>
            <div className="h-px bg-slate-700/30" />
            <div className="flex justify-between text-sm font-black text-sky-300">
              <span>Result (σ)</span>
              <span>227.6 MPa</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}