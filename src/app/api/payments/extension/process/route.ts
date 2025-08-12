// src/app/api/payments/extension/process/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

function addMonthsSafe(date: Date, monthsToAdd: number) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const targetMonth = month + monthsToAdd;
  const newDate = new Date(year, targetMonth, 1);

  // Calcular último día del mes resultante
  const lastDayOfTargetMonth = new Date(
    newDate.getFullYear(),
    newDate.getMonth() + 1,
    0
  ).getDate();

  // Usar el mínimo entre el día original y el último día del mes
  newDate.setDate(Math.min(day, lastDayOfTargetMonth));

  return newDate;
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

    // ✅ VERIFICAR SI YA FUE PROCESADO PARA EVITAR DUPLICACIÓN
    if (payment.extension_used === true) {
      return NextResponse.json(
        { 
          success: true, 
          message: "La extensión ya fue procesada anteriormente",
          already_processed: true 
        },
        { status: 200 }
      );
    }

    // Obtener parámetros necesarios (solo para verificar que el precio de extensión existe)
    const { data: params, error: paramsError } = await supabase
      .from("params")
      .select("id, name, value");

    if (paramsError) {
      return NextResponse.json(
        { error: "Error al obtener parámetros del sistema" },
        { status: 500 }
      );
    }

    // Verificar que el parámetro de precio de extensión existe
    const extensionPriceParam = params.find(
      (param) =>
        param.name?.toLowerCase().includes("precio") &&
        param.name?.toLowerCase().includes("extensión")
    );

    if (!extensionPriceParam) {
      return NextResponse.json(
        { error: "Parámetro de precio de extensión no encontrado" },
        { status: 500 }
      );
    }

    // Obtener parámetro de tiempo de extensión para calcular nueva fecha de extensión
    const extensionMonths = Number(params.find((p) => p.id === 3)?.value) || 2; // Default 2 meses

    // 🔥 EXTENSIÓN FIJA: SIEMPRE SUMAR 1 AÑO (12 MESES) 🔥
    const EXTENSION_MONTHS = 12; // Siempre 1 año, sin importar configuración

    // Calcular nueva fecha de expiración (extender por 1 año exacto)
    const currentExpirationDate = payment.expiration_date
      ? new Date(payment.expiration_date)
      : new Date();

    const newExpirationDate = addMonthsSafe(
      currentExpirationDate,
      EXTENSION_MONTHS
    );
    const newExtensionDate = addMonthsSafe(newExpirationDate, -extensionMonths);

    // Actualizar el pago con las nuevas fechas y marcar como extendido
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        expiration_date: newExpirationDate.toISOString(),
        extension_date: newExtensionDate.toISOString(),
        extension_used: true, // Marcar como ya extendido
      })
      .eq("id", payment_id);

    if (updateError) {
      console.error("Error al actualizar pago:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar las fechas de extensión" },
        { status: 500 }
      );
    }

    // También actualizar todos los vouchers asociados a este pago
    const { error: vouchersUpdateError } = await supabase
      .from("vouchers")
      .update({
        expiration_date: newExpirationDate.toISOString(),
      })
      .eq("payment_id", payment_id);

    if (vouchersUpdateError) {
      console.error("Error al actualizar vouchers:", vouchersUpdateError);
      // No fallar completamente, pero registrar el error
    }

    return NextResponse.json({
      success: true,
      message: "Extensión de 1 año procesada exitosamente",
      extension_period: "12 meses (1 año)",
      new_expiration_date: newExpirationDate.toISOString(),
      new_extension_date: newExtensionDate.toISOString(),
    });
  } catch (error) {
    console.error("Error al procesar extensión:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
