// src/app/api/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import StudentMiddleware from "@/modules/students/middleware";
import StudentController from "@/modules/students/controller";
import { supabase } from "@/lib/database/conection";

export async function POST(req: NextRequest) {
  return StudentMiddleware.validateCreate(req, StudentController.createStudent);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const voucher_id = searchParams.get("voucher_id");

    if (!voucher_id) {
      return NextResponse.json(
        { error: "voucher_id query parameter is required" },
        { status: 400 }
      );
    }

    // 1. Obtener la certificación asociada al voucher
    const { data: voucherData, error: voucherError } = await supabase
      .from("vouchers")
      .select("certification_id")
      .eq("id", voucher_id)
      .single();

    if (voucherError || !voucherData) {
      return NextResponse.json(
        { error: "Voucher not found or error retrieving voucher" },
        { status: 404 }
      );
    }

    // 2. Consultar los simuladores de la certificación (exams con simulator = true)
    const { data: exams, error: examsError } = await supabase
      .from("exams")
      .select("*")
      .eq("certification_id", voucherData.certification_id)
      .eq("simulator", true)
      .eq("active", true);

    if (examsError) {
      return NextResponse.json(
        { error: "Error fetching simulators" },
        { status: 500 }
      );
    }

    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
