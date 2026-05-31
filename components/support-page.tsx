import { ArrowRight, BookOpen, MessageSquare, Shield, Wand2 } from "lucide-react";

const supportCards = [
  {
    title: "Getting Started",
    copy: "Master the basics of simulations and workspace setup.",
    icon: BookOpen,
    tone: "text-sky-300 bg-sky-300/10",
  },
  {
    title: "Advanced Simulations",
    copy: "Deep dive into multithreaded calculations and complex modeling.",
    icon: Wand2,
    tone: "text-violet-300 bg-violet-300/10",
  },
  {
    title: "Security & Access",
    copy: "Manage permissions, credentials, and environment integrity.",
    icon: Shield,
    tone: "text-amber-300 bg-amber-300/10",
  },
  {
    title: "Contact Support",
    copy: "Reach a technical specialist for solver and deployment issues.",
    icon: MessageSquare,
    tone: "text-emerald-400 bg-emerald-400/10",
  },
];

export function SupportPage() {
  return (
    <div className="space-y-10 p-8">
      <section className="relative overflow-hidden py-8">
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-black tracking-tight text-slate-100 md:text-6xl">
            How can we <span className="italic text-sky-300">help?</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
            Access documentation, community wisdom, and direct technical
            assistance for the engineering suite.
          </p>

          <div className="relative mx-auto max-w-2xl">
            <input
              className="w-full rounded-full border-0 bg-[#1e232b] py-5 pl-6 pr-6 text-slate-100 placeholder:text-slate-500 outline-none ring-2 ring-transparent shadow-2xl shadow-sky-300/10 transition focus:ring-sky-300/40"
              placeholder="Search for documentation, errors, or simulations..."
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {supportCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              className="group flex flex-col items-start rounded-xl border border-slate-700/30 bg-[#161b22] p-8 text-left transition duration-300 hover:border-sky-300/30 hover:bg-[#1b2129]"
            >
              <div
                className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${card.tone} transition group-hover:scale-110`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mb-2 text-lg font-bold text-slate-100">
                {card.title}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-slate-400">
                {card.copy}
              </p>

              <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-300">
                Explore Guides <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
}