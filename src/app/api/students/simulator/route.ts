import { NextRequest, NextResponse } from "next/server";
import { getSimulatorsByVoucher } from "@/modules/students/simulators/controller";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const voucherId = searchParams.get("voucher_id");

  if (!voucherId) {
    return NextResponse.json(
      { error: "voucher_id es requerido" },
      { status: 400 }
    );
  }

  try {
    const simulators = await getSimulatorsByVoucher(Number(voucherId));
    return NextResponse.json({ data: simulators });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
