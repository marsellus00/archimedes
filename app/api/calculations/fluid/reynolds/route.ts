import { NextRequest, NextResponse } from "next/server";
import { persistCalculationFromRequest } from "@/lib/db/calculationRepository";
import { isApiError } from "@/lib/db/errors";
import {
  calculateReynoldsNumberModule,
  type ReynoldsNumberInput,
} from "@/lib/calculations/fluid/reynoldsCalculation";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "phase_4_reynolds_number_ready",
    method: "Re = ρvD/μ with internal-flow regime classification.",
    acceptedInput: {
      diameter_m: "positive number",
      velocity_m_s: "positive number",
      density_kg_m3: "positive number",
      viscosity_pa_s: "positive number",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReynoldsNumberInput;
    const outcome = calculateReynoldsNumberModule(body);

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
      safeBoundary: ["Preliminary calculation only; verify inputs before engineering use."],
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
