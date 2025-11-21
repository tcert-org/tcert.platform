import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnerId } = await params;

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      );
    }

    // Obtener datos del partner
    const { data, error } = await supabase
      .from("users")
      .select("id, company_name, email, contact_number, logo_url, page_url")
      .eq("id", partnerId)
      .eq("role_id", 5) // role_id 5 es para partners
      .single();

    if (error) {
      console.error("Error fetching partner:", error);
      return NextResponse.json(
        { error: "Error al obtener el partner" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Partner no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/partners/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnerId } = await params;
    const body = await request.json();
    const { company_name, contact_number, logo_url, page_url } = body;

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      );
    }

    if (!company_name) {
      return NextResponse.json(
        { error: "Nombre de empresa es requerido" },
        { status: 400 }
      );
    }

    if (!contact_number) {
      return NextResponse.json(
        { error: "Número de contacto es requerido" },
        { status: 400 }
      );
    }

    // Validar URLs si se proporcionan
    const urlRegex = /^https?:\/\/.+/;
    if (logo_url && logo_url.trim() && !urlRegex.test(logo_url)) {
      return NextResponse.json(
        { error: "Formato de URL del logo inválido" },
        { status: 400 }
      );
    }

    if (page_url && page_url.trim() && !urlRegex.test(page_url)) {
      return NextResponse.json(
        { error: "Formato de URL de la página web inválido" },
        { status: 400 }
      );
    }

    // Verificar que el partner existe
    const { data: existingPartner, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", partnerId)
      .eq("role_id", 5)
      .single();

    if (checkError || !existingPartner) {
      return NextResponse.json(
        { error: "Partner no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el partner (sin incluir email)
    const { data, error } = await supabase
      .from("users")
      .update({
        company_name: company_name.trim(),
        contact_number: contact_number.trim(),
        logo_url: logo_url ? logo_url.trim() : null,
        page_url: page_url ? page_url.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", partnerId)
      .eq("role_id", 5)
      .select()
      .single();

    if (error) {
      console.error("Error updating partner:", error);
      return NextResponse.json(
        { error: "Error al actualizar el partner" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Partner actualizado exitosamente",
      data,
    });
  } catch (error) {
    console.error("Error in PUT /api/partners/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
