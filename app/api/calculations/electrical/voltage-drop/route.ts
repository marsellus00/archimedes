import { NextRequest, NextResponse } from "next/server";
import { persistCalculationFromRequest } from "@/lib/db/calculationRepository";
import { isApiError } from "@/lib/db/errors";
import {
 calculateVoltageDrop,
 type VoltageDropInput,
} from "@/lib/calculations/electrical/voltageDrop";

export const runtime = "nodejs";

export async function GET() {
 return NextResponse.json({
 status: "voltage_drop_ready",
 method: "Single-phase or three-phase preliminary voltage-drop estimate using conductor resistance.",
 acceptedInput: {
 current_A: "positive number",
 oneWayLength_m: "positive number",
 conductorResistance_ohm_km: "positive number",
 systemVoltage_V: "positive number",
 powerFactor: "positive number <= 1",
 phaseCount: "1 for single-phase/two-wire equivalent or 3 for three-phase",
 },
 });
}

export async function POST(request: NextRequest) {
 try {
 const body = (await request.json()) as VoltageDropInput;
 const outcome = calculateVoltageDrop(body);

 if (!outcome.ok) {
 return NextResponse.json(
 { status: "calculation_validation_failed", issues: outcome.issues },
 { status: 400 },
 );
 }

 const persistence = await persistCalculationFromRequest({
 request,
 body: body as unknown as Record<string, unknown>,
 result: outcome.result,
 });

 return NextResponse.json({
 status: persistence.persisted
 ? "calculation_saved"
 : "calculation_complete",
 result: outcome.result,
 persistence,
 safeBoundary: [
 "Preliminary electrical estimate only; verify applicable code, conductor data, installation conditions, and qualified design review.",
 ],
 });
 } catch (error) {
 if (isApiError(error)) {
 return NextResponse.json(
 {
 status: "calculation_persistence_error",
 code: error.code,
 error: error.message,
 },
 { status: error.statusCode },
 );
 }

 return NextResponse.json(
 { status: "calculation_error", error: error instanceof Error ? error.message : "Unknown calculation error" },
 { status: 500 },
 );
 }
}
