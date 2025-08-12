// src/app/api/params/extension-price/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function GET(req: NextRequest) {
  try {
    // Obtener todos los parámetros
    const { data: allParams, error: allParamsError } = await supabase
      .from("params")
      .select("*");

    if (allParamsError) {
      return NextResponse.json(
        { error: "Error al obtener parámetros" },
        { status: 500 }
      );
    }

    // Buscar el parámetro de precio de extensión
    const extensionPriceParam = allParams.find(
      (param) =>
        param.name?.toLowerCase().includes("precio") &&
        param.name?.toLowerCase().includes("extensión")
    );

    if (!extensionPriceParam) {
      return NextResponse.json({
        exists: false,
        message: "Parámetro de precio de extensión no encontrado",
        suggestion:
          "Debe crear un parámetro con 'precio' y 'extensión' en el nombre",
      });
    }

    const price = parseFloat(extensionPriceParam.value || "0");

    return NextResponse.json({
      exists: true,
      param: {
        id: extensionPriceParam.id,
        name: extensionPriceParam.name,
        value: extensionPriceParam.value,
        price: price,
      },
      isValid: !isNaN(price) && price > 0,
    });
  } catch (error) {
    console.error(
      "Error al verificar parámetro de precio de extensión:",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
