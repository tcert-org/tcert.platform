import { NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function GET() {
  try {
    // Obtener parámetros específicos: Valor de certificación y Porcentaje de descuento a estudiantes
    const { data: params, error: paramsError } = await supabase
      .from("params")
      .select("id, name, value")
      .in("name", [
        "Valor de certificación a estudiantes",
        "Porcentaje de Descuento a Estudiantes",
      ]);

    if (paramsError) {
      console.error("[GET_PARAMS_ERROR]", paramsError.message);
      return NextResponse.json(
        { error: "Error al obtener los parámetros" },
        { status: 500 }
      );
    }

    // Obtener solo certificaciones activas (active = true)
    const { data: certifications, error: certificationsError } = await supabase
      .from("certifications")
      .select("id, name, description, logo_url, active")
      .eq("active", true); // Solo certificaciones donde active = true

    if (certificationsError) {
      console.error("[GET_CERTIFICATIONS_ERROR]", certificationsError.message);
      return NextResponse.json(
        { error: "Error al obtener las certificaciones" },
        { status: 500 }
      );
    }

    // Estructurar la respuesta
    const response = {
      params: params || [],
      certifications: certifications || [],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[CERTIFICATION_PARAMS_API_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
