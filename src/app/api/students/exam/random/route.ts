import { NextRequest, NextResponse } from "next/server";
import { getRandomExamForVoucher } from "@/modules/students/exams/controller";

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
    const exam = await getRandomExamForVoucher(Number(voucherId));
    return NextResponse.json({ data: exam });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
