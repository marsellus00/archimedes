import { NextRequest, NextResponse } from "next/server";
import { persistCalculationFromRequest } from "@/lib/db/calculationRepository";
import { isApiError } from "@/lib/db/errors";
import {
 calculateRetainingWallStability,
 type RetainingWallInput,
} from "@/lib/calculations/structural/retainingWall";

export const runtime = "nodejs";

export async function GET() {
 return NextResponse.json({
 status: "retaining_wall_ready",
 method: "Simplified Rankine active pressure with sliding and overturning screening checks.",
 acceptedInput: {
 wallHeight_m: "positive number",
 soilUnitWeight_kN_m3: "positive number",
 frictionAngle_deg: "0 to less than 45 for this simplified module",
 surcharge_kPa: "non-negative number",
 baseWidth_m: "positive number",
 wallWeight_kN_per_m: "positive number",
 baseFrictionCoefficient: "positive number",
 },
 });
}

export async function POST(request: NextRequest) {
 try {
 const body = (await request.json()) as RetainingWallInput;
 const outcome = calculateRetainingWallStability(body);

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
 "Safety-critical preliminary screen only; retaining walls require geotechnical and qualified engineering review.",
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
