import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { fullname } = await request.json();
    if (!fullname || typeof fullname !== "string") {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }
    // Next.js recomienda acceder a context.params de forma asíncrona
    const id = context.params?.id;
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
