import { NextRequest, NextResponse } from "next/server";
import { persistCalculationFromRequest } from "@/lib/db/calculationRepository";
import { isApiError } from "@/lib/db/errors";
import {
  calculateThermalConduction,
  type ThermalConductionInput,
} from "@/lib/calculations/thermal/conduction";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "phase_4_thermal_conduction_ready",
    method: "Fourier steady one-dimensional conduction through a flat layer.",
    acceptedInput: {
      area_m2: "positive number",
      thickness_m: "positive number",
      thermalConductivity_W_mK: "positive number",
      hotSideTemp_C: "number greater than coldSideTemp_C",
      coldSideTemp_C: "number",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ThermalConductionInput;
    const outcome = calculateThermalConduction(body);

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
      safeBoundary: ["Preliminary conduction estimate only; verify boundary conditions and material properties."],
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
