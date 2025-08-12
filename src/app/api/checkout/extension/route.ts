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

    const extensionPrice = parseFloat(extensionPriceParam?.value || "0");

    if (isNaN(extensionPrice) || extensionPrice <= 0) {
      return new Response(
        JSON.stringify({
          error: "El precio de extensión no está configurado correctamente",
        }),
        { status: 500 }
      );
    }

    const unitAmountInCents = Math.round(extensionPrice * 100);

    // Si solo queremos consultar el precio, no creamos sesión en Stripe
    if (onlyPrice) {
      return new Response(
        JSON.stringify({
          extension_price: extensionPrice,
          payment_id: payment_id,
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
              description: `Extensión de tiempo para los vouchers del pago #${payment_id}`,
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
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/partner/reports?extension_success=true&payment_id=${payment_id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/partner/reports?extension_canceled=true`,
    });

    return new Response(
      JSON.stringify({
        url: session.url,
        extension_price: extensionPrice,
        payment_id: payment_id,
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
