import { NextRequest, NextResponse } from "next/server";
import { persistCalculationFromRequest } from "@/lib/db/calculationRepository";
import { isApiError } from "@/lib/db/errors";
import {
  calculateOpenChannelFlow,
  type OpenChannelFlowInput,
} from "@/lib/calculations/hydraulic/openChannelFlow";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "phase_4_open_channel_flow_ready",
    method: "Manning equation for rectangular open-channel flow.",
    acceptedInput: {
      channelWidth_m: "positive number",
      flowDepth_m: "positive number",
      channelSlope_m_m: "positive number",
      manningN: "positive number",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OpenChannelFlowInput;
    const outcome = calculateOpenChannelFlow(body);

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
      safeBoundary: ["Preliminary calculation only; verify hydraulic assumptions before engineering use."],
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
