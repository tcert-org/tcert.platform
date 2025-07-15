import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { voucher_id } = await request.json();

    if (!voucher_id) {
      return NextResponse.json(
        { error: "voucher_id is required" },
        { status: 400 }
      );
    }

    type CertificationMaterialResponse = {
      certification: {
        study_material_url: string;
      };
    };

    const { data, error } = await supabase
      .from("vouchers")
      .select("certification:certification_id (study_material_url)")
      .eq("id", voucher_id)
      .single<CertificationMaterialResponse>();

    if (error || !data?.certification?.study_material_url) {
      console.error(
        "[SUPABASE_ERROR]",
        error?.message || "study_material_url not found"
      );
      return NextResponse.json(
        { error: "Material no encontrado" },
        { status: 404 }
      );
    }

    console.log("[MATERIAL_FOUND]", data.certification.study_material_url);

    return NextResponse.json({
      material: data.certification.study_material_url,
    });
  } catch (error) {
    console.error("[SERVER_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
