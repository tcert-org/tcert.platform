import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function POST(request: NextRequest) {
  try {
    const { fullname } = await request.json();
    if (!fullname || typeof fullname !== "string") {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }
    // Extraer el id de la URL
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    // Busca el id en la ruta: /api/students/[id]/update-name
    const idIndex = parts.findIndex((p) => p === "students") + 1;
    const id = parts[idIndex];
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    const { error } = await supabase
      .from("students")
      .update({ fullname })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
