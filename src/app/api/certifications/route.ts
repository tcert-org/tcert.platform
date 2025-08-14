import { NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

// GET - Obtener todas las certificaciones
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("certifications")
      .select("id, name, description, logo_url, active")
      .order("id", { ascending: true });

    if (error) {
      console.error("[GET_CERTIFICATIONS_ERROR]", error.message);
      return NextResponse.json(
        { error: "Error al obtener las certificaciones" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CERTIFICATIONS_API_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
