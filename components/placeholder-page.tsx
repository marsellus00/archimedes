import { TopSection } from "@/components/top-section";

type PlaceholderPageProps = {
  title: string;
  copy: string;
};

export function PlaceholderPage({ title, copy }: PlaceholderPageProps) {
  return (
    <div className="p-6 sm:p-8">
      <TopSection title={title} subtitle={copy} />
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-lg font-medium text-slate-900">This section is scaffolded for the proof of concept.</p>
        <p className="mt-2 text-sm text-slate-500">You can replace this with your real saved sessions, settings forms, authentication, or team features.</p>
      </div>
    </div>
  );
}