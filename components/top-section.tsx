type TopSectionProps = {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
};

export function TopSection({ title, subtitle, actions }: TopSectionProps) {
  return (
    <section className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>
      </div>
      {actions}
    </section>
  );
}