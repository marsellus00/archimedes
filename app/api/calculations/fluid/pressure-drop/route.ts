import { NextRequest, NextResponse } from "next/server";
import { persistCalculationFromRequest } from "@/lib/db/calculationRepository";
import { isApiError } from "@/lib/db/errors";
import { calculateFluidPressureDrop } from "@/lib/calculations/fluid/pressureDrop";
import {
  normalizeFluidPressureDropInput,
  type FluidPressureDropRequest,
} from "@/lib/calculations/fluid/schemas";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "phase_4_fluid_pressure_drop_ready",
    method:
      "Darcy-Weisbach pressure drop with Reynolds number classification and Darcy friction factor method selection.",
    acceptedInput: {
      diameter_m: "positive number, or diameter_mm as positive number",
      length_m: "positive number",
      velocity_m_s: "positive number",
      density_kg_m3: "positive number",
      viscosity_pa_s: "positive number",
      roughness_m: "optional non-negative number, or roughness_mm",
      minorLossCoefficient: "optional non-negative number, default 0",
      fluidName: "optional string",
      pipeMaterial: "optional string",
      temperature_C: "optional number",
    },
    example: {
      diameter_mm: 100,
      length_m: 20,
      velocity_m_s: 2,
      density_kg_m3: 998,
      viscosity_pa_s: 0.001,
      roughness_mm: 0.046,
      minorLossCoefficient: 0,
      fluidName: "Water",
      pipeMaterial: "Commercial steel",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FluidPressureDropRequest;
    const input = normalizeFluidPressureDropInput(body);
    const outcome = calculateFluidPressureDrop(input);

    if (!outcome.ok) {
      return NextResponse.json(
        {
          status: "phase_4_calculation_validation_failed",
          issues: outcome.issues,
        },
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
        "Preliminary calculation only; verify inputs and assumptions before engineering use.",
        "When DATABASE_URL is configured, this result is saved to the project calculation history and audit log.",
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
      {
        status: "phase_4_calculation_error",
        error: error instanceof Error ? error.message : "Unknown calculation error",
      },
      { status: 500 },
    );
  }
}
