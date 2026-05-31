import { NextRequest, NextResponse } from "next/server";
import { persistCalculationFromRequest } from "@/lib/db/calculationRepository";
import { isApiError } from "@/lib/db/errors";
import {
  calculateColumnBuckling,
  type ColumnBucklingInput,
} from "@/lib/calculations/structural/columnBuckling";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "phase_4_column_buckling_ready",
    method: "Euler elastic buckling screening check.",
    acceptedInput: {
      length_m: "positive number",
      effectiveLengthFactor: "positive number",
      elasticModulus_GPa: "positive number",
      momentOfInertia_cm4: "positive number",
      area_cm2: "positive number",
      appliedLoad_kN: "positive number",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ColumnBucklingInput;
    const outcome = calculateColumnBuckling(body);

    if (!outcome.ok) {
      return NextResponse.json(
        { status: "phase_4_calculation_validation_failed", issues: outcome.issues },
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
        ? "phase_5_calculation_saved"
        : "phase_4_calculation_complete",
      result: outcome.result,
      persistence,
      safeBoundary: [
        "Safety-critical preliminary screen only; structural members require qualified engineering review.",
      ],
    });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(
        {
          status: "phase_5_calculation_persistence_error",
          code: error.code,
          error: error.message,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { status: "phase_4_calculation_error", error: error instanceof Error ? error.message : "Unknown calculation error" },
      { status: 500 },
    );
  }
}
