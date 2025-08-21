import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

// PUT - Actualizar certificación específica
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de certificación inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, active, logo_url, study_material_url } = body;

    // Validar campos requeridos
    if (!name || !description) {
      return NextResponse.json(
        { error: "Nombre y descripción son requeridos" },
        { status: 400 }
      );
    }

    // Actualizar certificación
    const updateFields: any = {
      name: name.trim(),
      description: description.trim(),
      active: active,
      updated_at: new Date().toISOString(),
    };
    if (logo_url !== undefined) updateFields.logo_url = logo_url;
    if (study_material_url !== undefined)
      updateFields.study_material_url = study_material_url;

    const { data, error } = await supabase
      .from("certifications")
      .update(updateFields)
      .eq("id", id)
      .select("id, name, description, logo_url, study_material_url, active")
      .single();

    if (error) {
      console.error("[UPDATE_CERTIFICATION_ERROR]", error.message);
      return NextResponse.json(
        { error: "Error al actualizar la certificación" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Certificación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data,
        message: "Certificación actualizada exitosamente",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CERTIFICATION_UPDATE_API_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener certificación específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de certificación inválido" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("certifications")
      .select("id, name, description, logo_url, active")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[GET_CERTIFICATION_ERROR]", error.message);
      return NextResponse.json(
        { error: "Error al obtener la certificación" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Certificación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: data }, { status: 200 });
  } catch (error) {
    console.error("[CERTIFICATION_GET_API_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
