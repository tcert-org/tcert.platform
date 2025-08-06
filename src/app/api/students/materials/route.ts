import { NextRequest, NextResponse } from "next/server";
import { getMaterialFromVoucher } from "@/modules/students/materials/controller";

export async function POST(request: NextRequest) {
  try {
    const { voucher_id } = await request.json();

    if (!voucher_id) {
      return NextResponse.json(
        { error: "voucher_id es requerido" },
        { status: 400 }
      );
    }

    const material = await getMaterialFromVoucher(voucher_id);

    return NextResponse.json({ material }, { status: 200 });
  } catch (error) {
    console.error("[MATERIAL_API_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
