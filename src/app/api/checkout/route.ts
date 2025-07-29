import { NextRequest } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/database/conection";

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

export async function POST(req: NextRequest) {
  const { quantity, membership_id, onlyPrice } = await req.json();

  if (!quantity || !membership_id) {
    return new Response(
      JSON.stringify({ error: "Faltan datos requeridos" }),
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("membership")
    .select("price")
    .eq("id", membership_id)
    .single();

  if (error || !data?.price) {
    return new Response(
      JSON.stringify({ error: "No se pudo obtener el precio de la membresía" }),
      { status: 500 }
    );
  }

  const unitAmountInCents = Math.round(data.price * 100);

  // 👇 Si solo queremos consultar el precio, no creamos sesión en Stripe
  if (onlyPrice) {
    return new Response(
      JSON.stringify({ unit_price: data.price }),
      { status: 200 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Voucher Certificación" },
          unit_amount: unitAmountInCents,
        },
        quantity,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/partner/buy-vouchers?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/partner/buy-vouchers?canceled=true`,
  });

  return new Response(
    JSON.stringify({ url: session.url, unit_price: data.price }),
    { status: 200 }
  );
}
