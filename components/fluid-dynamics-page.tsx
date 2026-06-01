"use client";

import { useMemo, useState } from "react";
import {
 AlertTriangle,
 CheckCircle2,
 FileText,
 FlaskConical,
 Gauge,
 Sigma,
 Waves,
} from "lucide-react";
import { calculateFluidPressureDrop } from "@/lib/calculations/fluid/pressureDrop";
import {
 DEFAULT_COMMERCIAL_STEEL_ROUGHNESS_M,
 type FluidPressureDropInput,
} from "@/lib/calculations/fluid/schemas";
import { metersToMillimeters } from "@/lib/calculations/units/convert";

const waterPreset = {
 density_kg_m3: 998,
 viscosity_pa_s: 0.001002,
 fluidName: "Water",
 temperature_C: 20,
};

type InputProps = {
 label: string;
 value: number;
 setValue: (value: number) => void;
 unit: string;
 step?: number;
 min?: number;
 icon: React.ComponentType<{ className?: string }>;
};

function Input({ label, value, setValue, unit, step = 0.1, min = 0, icon: Icon }: InputProps) {
 return (
 <label className="block">
 <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
 {label}
 </span>
 <div className="flex items-center rounded-xl border border-slate-700/20 bg-[#10141a] px-4 py-3 focus-within:border-sky-300/30">
 <Icon className="mr-3 h-4 w-4 text-sky-300" />
 <input
 type="number"
 min={min}
 step={step}
 value={String(value)}
 onFocus={(event) => event.currentTarget.select()}
 onChange={(event) => {
 let value = parseInt(event.target.value, 10)
 if( value > 0){
 console.log(value)
 setValue(Number(value))
 }
 else {
 setValue(0)
 }
 }}
 className="w-full bg-transparent text-lg font-semibold text-slate-100 outline-none"
 />
 <span className="ml-3 whitespace-nowrap text-sm font-medium text-cyan-300">
 {unit}
 </span>
 </div>
 </label>
 );
}

function formatResult(value: number | string, unit?: string, digits = 3) {
 if (typeof value === "string") {
 return unit ? `${value} ${unit}` : value;
 }

 const formatted = value.toLocaleString(undefined, {
 maximumFractionDigits: digits,
 });

 return unit ? `${formatted} ${unit}` : formatted;
}

export function FluidDynamicsPage() {
 const [velocity, setVelocity] = useState(3);
 const [diameterMm, setDiameterMm] = useState(50);
 const [lengthM, setLengthM] = useState(20);
 const [density, setDensity] = useState(waterPreset.density_kg_m3);
 const [viscosity, setViscosity] = useState(waterPreset.viscosity_pa_s);
 const [roughnessMm, setRoughnessMm] = useState(
 metersToMillimeters(DEFAULT_COMMERCIAL_STEEL_ROUGHNESS_M),
 );
 const [minorLossCoefficient, setMinorLossCoefficient] = useState(0);

 const input: FluidPressureDropInput = useMemo(
 () => ({
 diameter_m: diameterMm / 1000,
 length_m: lengthM,
 velocity_m_s: velocity,
 density_kg_m3: density,
 viscosity_pa_s: viscosity,
 roughness_m: roughnessMm / 1000,
 minorLossCoefficient,
 fluidName: waterPreset.fluidName,
 pipeMaterial: "Commercial steel",
 temperature_C: waterPreset.temperature_C,
 }),
 [density, diameterMm, lengthM, minorLossCoefficient, roughnessMm, velocity, viscosity],
 );

 const outcome = useMemo(() => calculateFluidPressureDrop(input), [input]);
 const result = outcome.ok ? outcome.result : null;

 return (
 <div className="space-y-8 p-8">
 <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
 <div className="max-w-3xl">
 <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1">
 <Sigma className="h-3.5 w-3.5 text-emerald-300" />
 <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">
 Deterministic Engine
 </span>
 </div>

 <h1 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
 Fluid Dynamics Calculator
 </h1>
 <p className="mt-3 text-base leading-7 text-slate-400">
 Traceable preliminary pipe-flow calculation using shared calculation modules,
 input validation, live formulas, assumptions, warnings, and limitations.
 </p>
 </div>

 <div className="rounded-xl bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-300">
 Calculation Engine Active
 </div>
 </section>

 <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
 <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-6 xl:col-span-7">
 <div className="mb-6 flex items-center justify-between gap-4">
 <div>
 <h3 className="text-lg font-semibold tracking-tight text-slate-100">
 Input Parameters
 </h3>
 <p className="mt-1 text-sm text-slate-500">
 SI units. Fluid preset: water at 20 °C. Roughness is editable.
 </p>
 </div>
 <span className="rounded-full bg-[#10141a] px-3 py-1 text-xs font-medium text-slate-500">
 API: /api/calculations/fluid/pressure-drop
 </span>
 </div>

 <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
 <Input
 label="Flow velocity"
 value={velocity}
 setValue={setVelocity}
 unit="m/s"
 icon={Waves}
 />
 <Input
 label="Pipe diameter"
 value={diameterMm}
 setValue={setDiameterMm}
 unit="mm"
 icon={Gauge}
 />
 <Input
 label="Pipe length"
 value={lengthM}
 setValue={setLengthM}
 unit="m"
 icon={FileText}
 />
 <Input
 label="Density"
 value={density}
 setValue={setDensity}
 unit="kg/m³"
 icon={FlaskConical}
 />
 <Input
 label="Dynamic viscosity"
 value={viscosity}
 setValue={setViscosity}
 unit="Pa·s"
 step={0.000001}
 icon={Sigma}
 />
 <Input
 label="Pipe roughness"
 value={roughnessMm}
 setValue={setRoughnessMm}
 unit="mm"
 step={0.001}
 icon={Gauge}
 />
 <div className="md:col-span-2">
 <Input
 label="Combined minor-loss coefficient K"
 value={minorLossCoefficient}
 setValue={setMinorLossCoefficient}
 unit="—"
 step={0.1}
 icon={Sigma}
 />
 </div>
 </div>
 </div>

 <div className="rounded-2xl border border-slate-700/30 bg-[#161b22] p-6 xl:col-span-5">
 <h3 className="text-lg font-semibold tracking-tight text-slate-100">
 Calculated Results
 </h3>

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
 {[
 ["Flow regime", result?.results.flowRegime.value],
 ["Reynolds number", formatResult(result?.results.reynoldsNumber.value ?? 0)],
 ["Friction factor", formatResult(result?.results.frictionFactor.value ?? 0, undefined, 6)],
 [
 "Pressure drop",
 formatResult(
 result?.results.totalPressureDrop_kPa.value ?? 0,
 result?.results.totalPressureDrop_kPa.unit,
 3,
 ),
 ],
 [
 "Volumetric flow",
 formatResult(
 result?.results.volumetricFlowRate_m3_s.value ?? 0,
 result?.results.volumetricFlowRate_m3_s.unit,
 6,
 ),
 ],
 ["Friction method", result?.fluid.frictionFactorMethod],
 ].map(([label, value]) => (
 <div
 key={label}
 className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/20 bg-[#10141a] px-4 py-4"
 >
 <span className="text-sm text-slate-500">{label}</span>
 <span className="text-right font-mono text-sm font-semibold text-sky-300">
 {value}
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
 <div key={formula.label} className="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
 <p className="text-sm font-semibold text-slate-200">{formula.label}</p>
 <p className="mt-1 font-mono text-sm text-slate-300">{formula.formula}</p>
 {formula.description ? (
 <p className="mt-1 text-xs leading-5 text-slate-500">{formula.description}</p>
 ) : null}
 </div>
 ))}
 </div>
 </div>

 <div className="rounded-2xl border border-emerald-300/20 bg-[#10141a] p-5">
 <div className="text-sm font-semibold text-emerald-300">Calculation Steps</div>
 <div className="mt-4 space-y-3">
 {result.steps.map((step) => (
 <div key={step.label} className="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
 <p className="text-sm font-semibold text-slate-200">{step.label}</p>
 <p className="mt-1 font-mono text-xs leading-5 text-slate-400">{step.expression}</p>
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
 icon={AlertTriangle}
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
 icon: React.ComponentType<{ className?: string }>;
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
