import { NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

// GET - Obtener todas las certificaciones
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("certifications")
      .select(
        "id, name, description, audience, logo_url, active, study_material_url"
      )
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

// POST - Crear una nueva certificación
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      audience,
      logo_url,
      active,
      study_material_url,
    } = body;

    if (
      !name ||
      !description ||
      !audience ||
      !logo_url ||
      typeof active !== "boolean" ||
      !study_material_url
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("certifications")
      .insert([
        { name, description, audience, logo_url, active, study_material_url },
      ])
      .select();

    if (error) {
      console.error("[POST_CERTIFICATION_ERROR]", error.message);
      return NextResponse.json(
        { error: "Error al crear la certificación" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data?.[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST_CERTIFICATION_API_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
