// src/app/api/payments/extension/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

export async function GET(req: NextRequest) {
  try {
    // Obtener el precio de extensión desde los parámetros
    // Primero intentamos buscar por nombre que contenga "precio" y "extensión"
    const { data: allParams, error: allParamsError } = await supabase
      .from("params")
      .select("*");

    if (allParamsError) {
      console.error("Error al obtener parámetros:", allParamsError);
      return NextResponse.json(
        { error: "No se pudo obtener los parámetros" },
        { status: 500 }
      );
    }

    // Buscar el parámetro de precio de extensión por nombre
    const extensionPriceParam = allParams.find(
      (param) =>
        param.name?.toLowerCase().includes("precio") &&
        param.name?.toLowerCase().includes("extensión")
    );

    if (!extensionPriceParam) {
      return NextResponse.json(
        {
          error:
            "Parámetro de precio de extensión no encontrado. Debe configurar un parámetro con 'precio' y 'extensión' en el nombre.",
        },
        { status: 404 }
      );
    }

    const extensionPrice = parseFloat(extensionPriceParam?.value || "0");

    if (isNaN(extensionPrice) || extensionPrice <= 0) {
      return NextResponse.json(
        { error: "El precio de extensión no está configurado correctamente" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      extension_price: extensionPrice,
      param_id: extensionPriceParam.id,
      param_name: extensionPriceParam.name,
    });
  } catch (error) {
    console.error("Error en API de extensión:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { payment_id } = await req.json();

    if (!payment_id) {
      return NextResponse.json(
        { error: "payment_id es requerido" },
        { status: 400 }
      );
    }

    // Obtener información del pago
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", payment_id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Obtener todos los parámetros y buscar el de precio de extensión
    const { data: allParams, error: allParamsError } = await supabase
      .from("params")
      .select("*");

    if (allParamsError) {
      return NextResponse.json(
        { error: "No se pudo obtener los parámetros" },
        { status: 500 }
      );
    }

    const extensionPriceParam = allParams.find(
      (param) =>
        param.name?.toLowerCase().includes("precio") &&
        param.name?.toLowerCase().includes("extensión")
    );

    if (!extensionPriceParam) {
      return NextResponse.json(
        { error: "Parámetro de precio de extensión no encontrado" },
        { status: 404 }
      );
    }

    const extensionPrice = parseFloat(extensionPriceParam?.value || "0");

    if (isNaN(extensionPrice) || extensionPrice <= 0) {
      return NextResponse.json(
        { error: "El precio de extensión no está configurado correctamente" },
        { status: 500 }
      );
    }

    // Retornar la información necesaria para el checkout
    return NextResponse.json({
      success: true,
      payment_id,
      extension_price: extensionPrice,
      partner_id: payment.partner_id,
    });
  } catch (error) {
    console.error("Error al procesar extensión:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
