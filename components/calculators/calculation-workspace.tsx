"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type ComponentType } from "react";
import {
 AlertTriangle,
 ArrowLeft,
 Calculator,
 CheckCircle2,
 FileText,
 Gauge,
 Info,
 Database,
 Save,
} from "lucide-react";
import type {
 CalculationOutcome,
 CalculationResult,
 ResultValue,
} from "@/lib/calculations/common/resultTypes";

type NumericValues = object;

export type CalculatorField = {
 key: string;
 label: string;
 unit?: string;
 step?: number;
 min?: number;
 helper?: string;
};

type CalculationWorkspaceProps<TInput extends NumericValues, TResult extends CalculationResult> = {
 title: string;
 eyebrow: string;
 description: string;
 endpoint: string;
 fields: CalculatorField[];
 initialValues: TInput;
 calculate: (values: TInput) => CalculationOutcome<TResult>;
 primaryResults?: string[];
};

function formatValue(value: ResultValue): string {
 const formattedValue =
 typeof value.value === "number"
 ? value.value.toLocaleString(undefined, {
 maximumFractionDigits: value.precision ?? 3,
 })
 : value.value;

 return value.unit ? `${formattedValue} ${value.unit}` : `${formattedValue}`;
}

export function CalculationWorkspace<TInput extends NumericValues, TResult extends CalculationResult>({
 title,
 eyebrow,
 description,
 endpoint,
 fields,
 initialValues,
 calculate,
 primaryResults,
}: CalculationWorkspaceProps<TInput, TResult>) {
 const [values, setValues] = useState<TInput>(initialValues);
 const [saveStatus, setSaveStatus] = useState<string | null>(null);
 const [isSaving, setIsSaving] = useState(false);
 const outcome = useMemo(() => calculate(values), [calculate, values]);
 const result = outcome.ok ? outcome.result : null;

 const resultEntries = result
 ? Object.entries(result.results).sort(([a], [b]) => {
 const aIndex = primaryResults?.indexOf(a) ?? -1;
 const bIndex = primaryResults?.indexOf(b) ?? -1;

 if (aIndex === -1 && bIndex === -1) return 0;
 if (aIndex === -1) return 1;
 if (bIndex === -1) return -1;
 return aIndex - bIndex;
 })
 : [];

 function updateValue(key: string, nextValue: number) {
 setSaveStatus(null);
 setValues((current) => ({
 ...(current as Record<string, unknown>),
 [key]: nextValue,
 }) as TInput);
 }

 async function saveCalculation() {
 if (!result || isSaving) return;

 setIsSaving(true);
 setSaveStatus(null);

 try {
 const response = await fetch(endpoint, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "x-engineering-user-id": "calculator-local-user",
 "x-engineering-user-email": "calculator-local-user@engineering.local",
 "x-engineering-user-name": "Calculator Local User",
 },
 body: JSON.stringify({
 ...(values as Record<string, unknown>),
 projectId: "local-calculations",
 unitSystem: "SI",
 }),
 });

 const data = (await response.json()) as {
 persistence?: { persisted?: boolean; calculationId?: string; status?: string };
 error?: string;
 };

 if (!response.ok || data.error) {
 throw new Error(data.error ?? "Calculation save failed.");
 }

 if (data.persistence?.persisted) {
 setSaveStatus(`Saved to project history (${data.persistence.calculationId}).`);
 } else {
 setSaveStatus(
 "Calculated locally. Configure DATABASE_URL to persist this calculation.",
 );
 }
 } catch (error) {
 setSaveStatus(error instanceof Error ? error.message : "Unknown save error.");
 } finally {
 setIsSaving(false);
 }
 }

 return (
 <div className="space-y-8 p-8">
 <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
 <div className="max-w-4xl">
 <Link
 href="/calculators"
 className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300 hover:underline"
 >
 <ArrowLeft className="h-3.5 w-3.5" />
 All calculators
 </Link>
 <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1">
 <Calculator className="h-3.5 w-3.5 text-emerald-300" />
 <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">
 {eyebrow}
 </span>
 </div>

 <h1 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
 {title}
 </h1>
 <p className="mt-3 text-base leading-7 text-slate-400">{description}</p>
 </div>

 <div className="flex flex-col gap-2 md:items-end">
 <div className="rounded-xl bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-300">
 Deterministic Engine Active
 </div>
 <div className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/5 px-4 py-2 text-xs font-medium text-sky-200">
 <Database className="h-4 w-4" />
 Project history ready
 </div>
 </div>
 </section>

 <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
 <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-6 xl:col-span-7">
 <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
 <div>
 <h3 className="text-lg font-semibold tracking-tight text-slate-100">
 Input Parameters
 </h3>
 <p className="mt-1 text-sm text-slate-500">
 Edit values to update the calculation trace live. Inputs are validated before results are shown.
 </p>
 </div>
 <span className="rounded-full bg-[#10141a] px-3 py-1 text-xs font-medium text-slate-500">
 API: {endpoint}
 </span>
 </div>

 <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
 {fields.map((field) => (
 <label key={field.key} className="block">
 <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
 {field.label}
 </span>
 <div className="flex items-center rounded-xl border border-slate-700/20 bg-[#10141a] px-4 py-3 focus-within:border-sky-300/30">
 <Gauge className="mr-3 h-4 w-4 text-sky-300" />
 <input
 type="number"
 min={field.min}
 step={field.step ?? 0.1}
 value={Number((values as Record<string, unknown>)[field.key] ?? 0)}
 onFocus={(event) => event.currentTarget.select()}
 onChange={(event: ChangeEvent<HTMLInputElement>) => updateValue(field.key, Number(event.target.value))}
 className="w-full bg-transparent text-lg font-semibold text-slate-100 outline-none"
 />
 {field.unit ? (
 <span className="ml-3 whitespace-nowrap text-sm font-medium text-cyan-300">
 {field.unit}
 </span>
 ) : null}
 </div>
 {field.helper ? (
 <span className="mt-2 block text-xs leading-5 text-slate-500">
 {field.helper}
 </span>
 ) : null}
 </label>
 ))}
 </div>
 </div>

 <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-6 xl:col-span-5">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <h3 className="text-lg font-semibold tracking-tight text-slate-100">
 Calculated Results
 </h3>
 <button
 type="button"
 onClick={saveCalculation}
 disabled={!result || isSaving}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/30 bg-sky-300/5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-sky-200 transition hover:bg-sky-300/10 disabled:cursor-not-allowed disabled:opacity-50"
 >
 <Save className="h-4 w-4" />
 {isSaving ? "Saving" : "Save"}
 </button>
 </div>

 {saveStatus ? (
 <div className="mt-4 rounded-xl border border-slate-700/30 bg-[#10141a] px-4 py-3 text-xs leading-5 text-slate-300">
 {saveStatus}
 </div>
 ) : null}

 {!outcome.ok ? (
 <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-200">
 <div className="mb-2 flex items-center gap-2 font-semibold">
 <AlertTriangle className="h-4 w-4" />
 Validation required
 </div>
 <ul className="space-y-1 text-rose-100/80">
 {outcome.issues.map((issue) => (
 <li key={`${issue.field}-${issue.message}`}>• {issue.message}</li>
 ))}
 </ul>
 </div>
 ) : (
 <div className="mt-5 space-y-3">
 {resultEntries.map(([key, value]) => (
 <div
 key={key}
 className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/20 bg-[#10141a] px-4 py-4"
 >
 <span className="text-sm text-slate-500">{value.label}</span>
 <span className="text-right font-mono text-sm font-semibold text-sky-300">
 {formatValue(value)}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>

 {result ? (
 <>
 <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-6 xl:col-span-12">
 <div className="mb-5 flex items-center gap-2">
 <FileText className="h-5 w-5 text-sky-300" />
 <h3 className="text-lg font-semibold tracking-tight text-slate-100">
 Formula and Calculation Trace
 </h3>
 </div>

 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <div className="rounded-2xl border border-sky-300/20 bg-[#10141a] p-5">
 <div className="text-sm font-semibold text-sky-300">Formulas</div>
 <div className="mt-4 space-y-3">
 {result.formulas.map((formula) => (
 <div
 key={formula.label}
 className="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0"
 >
 <p className="text-sm font-semibold text-slate-200">{formula.label}</p>
 <p className="mt-1 font-mono text-sm text-slate-300">{formula.formula}</p>
 {formula.description ? (
 <p className="mt-1 text-xs leading-5 text-slate-500">
 {formula.description}
 </p>
 ) : null}
 </div>
 ))}
 </div>
 </div>

 <div className="rounded-2xl border border-emerald-300/20 bg-[#10141a] p-5">
 <div className="text-sm font-semibold text-emerald-300">Calculation Steps</div>
 <div className="mt-4 space-y-3">
 {result.steps.map((step) => (
 <div
 key={step.label}
 className="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0"
 >
 <p className="text-sm font-semibold text-slate-200">{step.label}</p>
 <p className="mt-1 font-mono text-xs leading-5 text-slate-400">
 {step.expression}
 </p>
 <p className="mt-1 font-mono text-sm text-emerald-300">{step.result}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4 xl:col-span-12 lg:grid-cols-3">
 <TraceCard
 title="Assumptions"
 icon={CheckCircle2}
 tone="border-emerald-300/20 text-emerald-300"
 items={result.assumptions}
 />
 <TraceCard
 title="Missing / Optional Data"
 icon={Info}
 tone="border-amber-300/20 text-amber-300"
 items={result.missingData}
 />
 <TraceCard
 title="Warnings & Limitations"
 icon={AlertTriangle}
 tone="border-rose-300/20 text-rose-300"
 items={[...result.warnings, ...result.limitations]}
 />
 </div>
 </>
 ) : null}
 </div>
 </div>
 );
}

type TraceCardProps = {
 title: string;
 items: string[];
 icon: ComponentType<{ className?: string }>;
 tone: string;
};

function TraceCard({ title, items, icon: Icon, tone }: TraceCardProps) {
 return (
 <div className={`rounded-2xl border bg-[#10141a] p-5 ${tone}`}>
 <div className="flex items-center gap-2 text-sm font-semibold">
 <Icon className="h-4 w-4" />
 {title}
 </div>
 <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
 {(items.length ? items : ["None identified for this preliminary calculation."]).map(
 (item) => (
 <li key={item}>• {item}</li>
 ),
 )}
 </ul>
 </div>
 );
}
