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

    // Verificar si ya fue extendido
    if (payment.extension_used === true) {
      return NextResponse.json(
        { error: "Esta extensión ya fue utilizada" },
        { status: 400 }
      );
    }

    // Obtener información de vouchers asignados para este pago específico
    const { data: voucherInfo, error: voucherError } = await supabase.rpc(
      "get_assigned_vouchers_by_payment",
      {
        payment_id_param: payment_id,
      }
    );

    console.log("🔍 DEBUG SQL Function Result:", {
      voucherInfo,
      voucherError,
      payment_id,
    });

    if (voucherError || !voucherInfo || voucherInfo.length === 0) {
      console.error("Error en función SQL:", voucherError);
      return NextResponse.json(
        { error: "No se pudo obtener información de vouchers del pago" },
        { status: 500 }
      );
    }

    const {
      total_vouchers_in_payment,
      assigned_vouchers_count,
      unassigned_vouchers_count,
      unit_price_per_voucher,
      partner_id_info,
    } = voucherInfo[0];

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

    const extensionPricePerVoucher = parseFloat(
      extensionPriceParam?.value || "0"
    );

    if (isNaN(extensionPricePerVoucher) || extensionPricePerVoucher <= 0) {
      return NextResponse.json(
        { error: "El precio de extensión no está configurado correctamente" },
        { status: 500 }
      );
    }

    // 🎯 CALCULAR PRECIO SOLO POR VOUCHERS NO ASIGNADOS (los que necesitan extensión)
    const totalExtensionPrice =
      unassigned_vouchers_count * extensionPricePerVoucher;

    // Debug logging para revisar los valores
    console.log("🔍 DEBUG Extension Calculation:", {
      payment_id,
      total_vouchers_in_payment,
      assigned_vouchers_count,
      unassigned_vouchers_count,
      extensionPricePerVoucher,
      totalExtensionPrice,
      calculation: `${unassigned_vouchers_count} × ${extensionPricePerVoucher} = ${totalExtensionPrice}`,
    });

    // Si no hay vouchers no asignados, no se cobra nada
    if (unassigned_vouchers_count === 0) {
      return NextResponse.json(
        {
          error:
            "Este pago no tiene vouchers sin asignar, todos ya están siendo utilizados y no necesitan extensión",
          info: true,
          assigned_vouchers_count,
          total_vouchers_in_payment,
        },
        { status: 400 }
      );
    }

    // Retornar la información necesaria para el checkout
    return NextResponse.json({
      success: true,
      payment_id,
      extension_price: totalExtensionPrice,
      extension_price_per_voucher: extensionPricePerVoucher,
      partner_id: payment.partner_id,
      voucher_breakdown: {
        total_vouchers_in_payment,
        assigned_vouchers_count,
        unassigned_vouchers_count,
        unit_price_per_voucher,
        total_extension_price: totalExtensionPrice,
      },
    });
  } catch (error) {
    console.error("Error al procesar extensión:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
