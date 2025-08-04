import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnerId = params.id;

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      );
    }

    // Obtener datos del partner
    const { data, error } = await supabase
      .from("users")
      .select("id, company_name, email")
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
  { params }: { params: { id: string } }
) {
  try {
    const partnerId = params.id;
    const body = await request.json();
    const { company_name, email } = body;

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      );
    }

    if (!company_name || !email) {
      return NextResponse.json(
        { error: "Nombre de empresa y correo son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
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

    // Verificar si el email ya existe en otro usuario
    const { data: emailCheck, error: emailError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", partnerId);

    if (emailError) {
      console.error("Error checking email:", emailError);
      return NextResponse.json(
        { error: "Error al verificar email" },
        { status: 500 }
      );
    }

    if (emailCheck && emailCheck.length > 0) {
      return NextResponse.json(
        { error: "El correo electrónico ya está en uso" },
        { status: 400 }
      );
    }

    // Actualizar el partner
    const { data, error } = await supabase
      .from("users")
      .update({
        company_name: company_name.trim(),
        email: email.trim().toLowerCase(),
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
