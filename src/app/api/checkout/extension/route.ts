// src/app/api/checkout/extension/route.ts

import { NextRequest } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/database/conection";

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { payment_id, onlyPrice } = await req.json();

    if (!payment_id) {
      return new Response(
        JSON.stringify({ error: "payment_id es requerido" }),
        { status: 400 }
      );
    }

    // Obtener información del pago original
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", payment_id)
      .single();

    if (paymentError || !payment) {
      return new Response(JSON.stringify({ error: "Pago no encontrado" }), {
        status: 404,
      });
    }

    // Obtener todos los parámetros y buscar el de precio de extensión
    const { data: allParams, error: allParamsError } = await supabase
      .from("params")
      .select("*");

    if (allParamsError) {
      return new Response(
        JSON.stringify({ error: "No se pudo obtener los parámetros" }),
        { status: 500 }
      );
    }

    const extensionPriceParam = allParams.find(
      (param) =>
        param.name?.toLowerCase().includes("precio") &&
        param.name?.toLowerCase().includes("extensión")
    );

    if (!extensionPriceParam) {
      return new Response(
        JSON.stringify({
          error:
            "Parámetro de precio de extensión no encontrado. Debe configurar un parámetro con 'precio' y 'extensión' en el nombre.",
        }),
        { status: 404 }
      );
    }

    const extensionPricePerVoucher = parseFloat(
      extensionPriceParam?.value || "0"
    );

    if (isNaN(extensionPricePerVoucher) || extensionPricePerVoucher <= 0) {
      return new Response(
        JSON.stringify({
          error: "El precio de extensión no está configurado correctamente",
        }),
        { status: 500 }
      );
    }

    // 🎯 Obtener información específica de vouchers para este pago
    const { data: voucherInfo, error: voucherError } = await supabase.rpc(
      "get_assigned_vouchers_by_payment",
      {
        payment_id_param: payment_id,
      }
    );

    if (voucherError || !voucherInfo || voucherInfo.length === 0) {
      console.error("Error obteniendo vouchers para checkout:", voucherError);
      return new Response(
        JSON.stringify({
          error: "No se pudo obtener información de vouchers del pago",
        }),
        { status: 500 }
      );
    }

    const {
      total_vouchers_in_payment,
      assigned_vouchers_count,
      unassigned_vouchers_count,
    } = voucherInfo[0];

    // Calcular el precio total basado en vouchers sin asignar
    const totalExtensionPrice =
      unassigned_vouchers_count * extensionPricePerVoucher;

    console.log("🔍 DEBUG Checkout Calculation:", {
      payment_id,
      total_vouchers_in_payment,
      assigned_vouchers_count,
      unassigned_vouchers_count,
      extensionPricePerVoucher,
      totalExtensionPrice,
      calculation: `${unassigned_vouchers_count} × ${extensionPricePerVoucher} = ${totalExtensionPrice}`,
    });

    // Verificar que hay vouchers para extender
    if (unassigned_vouchers_count === 0) {
      return new Response(
        JSON.stringify({
          error: "Este pago no tiene vouchers sin asignar para extender",
        }),
        { status: 400 }
      );
    }

    const unitAmountInCents = Math.round(totalExtensionPrice * 100);

    // Si solo queremos consultar el precio, no creamos sesión en Stripe
    if (onlyPrice) {
      return new Response(
        JSON.stringify({
          extension_price: totalExtensionPrice,
          extension_price_per_voucher: extensionPricePerVoucher,
          payment_id: payment_id,
          voucher_breakdown: {
            total_vouchers_in_payment,
            assigned_vouchers_count,
            unassigned_vouchers_count,
            total_extension_price: totalExtensionPrice,
          },
        }),
        { status: 200 }
      );
    }

    // Crear sesión de Stripe para el pago de extensión
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Extensión de Vouchers - Pago #${payment_id}`,
              description: `Extensión de ${unassigned_vouchers_count} vouchers sin asignar del pago #${payment_id}`,
            },
            unit_amount: unitAmountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        payment_id: payment_id.toString(),
        extension_type: "voucher_extension",
        unassigned_vouchers_count: unassigned_vouchers_count.toString(),
        total_extension_price: totalExtensionPrice.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/partner/reports?extension_success=true&payment_id=${payment_id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/partner/reports?extension_canceled=true`,
    });

    return new Response(
      JSON.stringify({
        url: session.url,
        extension_price: totalExtensionPrice,
        extension_price_per_voucher: extensionPricePerVoucher,
        payment_id: payment_id,
        voucher_breakdown: {
          total_vouchers_in_payment,
          assigned_vouchers_count,
          unassigned_vouchers_count,
          total_extension_price: totalExtensionPrice,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en checkout de extensión:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 }
    );
  }
}
