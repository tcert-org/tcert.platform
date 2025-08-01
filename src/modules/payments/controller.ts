// src/modules/payments/controller.ts

import { NextRequest, NextResponse } from "next/server";
import PaymentTable, { FilterParamsPayment } from "@/modules/payments/table";
import { PaymentsInsertType } from "./types";
import { ApiResponse } from "@/lib/types";
import { supabase } from "@/lib/database/conection";

function addMonthsSafe(date: Date, monthsToAdd: number) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const targetMonth = month + monthsToAdd;
  const newDate = new Date(year, targetMonth, 1);

  // Calcular último día del mes resultante
  const lastDayOfTargetMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();

  // Usar el mínimo entre el día original y el último día del mes
  newDate.setDate(Math.min(day, lastDayOfTargetMonth));

  return newDate;
}

export default class PaymentController {
  static async createPayment(data: PaymentsInsertType): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const paymentTable = new PaymentTable();

      // Obtener los valores desde la tabla 'params'
      const { data: params, error: paramsError } = await supabase
        .from("params")
        .select("id, value")
        .in("id", [1, 3]); // 1: Expiración Vouchers, 3: Tiempo Extensión

      if (paramsError) throw new Error("Error al obtener parámetros del sistema");

      const expirationMonths = Number(params.find(p => p.id === 1)?.value);
      const extensionMonths = Number(params.find(p => p.id === 3)?.value);

      if (!expirationMonths || !extensionMonths) {
        throw new Error("Faltan parámetros de expiración o extensión");
      }

      const now = new Date();

      // Calcular fechas usando lógica segura
      const expirationDate = addMonthsSafe(now, expirationMonths);
      const extensionDate = addMonthsSafe(expirationDate, -extensionMonths);

      data.expiration_date = expirationDate.toISOString();
      (data as any).extension_date = extensionDate.toISOString();

      // 1. Insertar el pago con ambas fechas
      const result = await paymentTable.createPayment(data);

      // 2. Calcular total de vouchers del partner
      const { data: allPayments, error: totalError } = await supabase
        .from("payments")
        .select("voucher_quantity")
        .eq("partner_id", data.partner_id);

      if (totalError) throw new Error("Error al obtener pagos del partner");

      const totalVouchers = allPayments.reduce(
        (sum, row) => sum + (row.voucher_quantity ?? 0),
        0
      );

      // 3. Obtener membresía correspondiente
      const { data: memberships, error: membershipError } = await supabase
        .from("membership")
        .select("*");

      if (membershipError) throw new Error("Error al obtener membresías");

      const newMembership = memberships.find(
        (m) => totalVouchers >= m.count_from && totalVouchers <= m.count_up
      );

      let updatedMembershipId = null;

      if (newMembership) {
        const { data: currentUser, error: userError } = await supabase
          .from("users")
          .select("membership_id")
          .eq("id", data.partner_id)
          .single();

        if (userError) throw new Error("Error al obtener usuario");

        if (newMembership.id !== currentUser.membership_id) {
          await supabase
            .from("users")
            .update({ membership_id: newMembership.id })
            .eq("id", data.partner_id);
        }

        updatedMembershipId = newMembership.id;
      }

      return NextResponse.json({
        statusCode: 201,
        data: {
          payment: result,
          new_membership_id: updatedMembershipId,
        },
      });
    } catch (error) {
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  static async getPaymentsWithFilters(
    req: NextRequest
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const searchParams = req.nextUrl.searchParams;

      const filters: FilterParamsPayment = {
        filter_partner_name: searchParams.get("filter_partner_name") ?? undefined,
        filter_created_at: searchParams.get("filter_created_at") ?? undefined,
        filter_created_at_op: searchParams.get("filter_created_at_op") ?? undefined,
        filter_total_price: searchParams.get("filter_total_price")
          ? Number(searchParams.get("filter_total_price"))
          : undefined,
        filter_total_price_op: searchParams.get("filter_total_price_op") ?? undefined,
        order_by: searchParams.get("order_by") ?? "created_at",
        order_dir: searchParams.get("order_dir") ?? "desc",
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
        limit_value: searchParams.get("limit_value")
          ? Number(searchParams.get("limit_value"))
          : 10,
      };

      const paymentTable = new PaymentTable();
      const { data, totalCount } = await paymentTable.getPaymentsWithFilters(filters);

      return NextResponse.json({
        statusCode: 200,
        data,
        meta: { totalCount },
      });
    } catch (error) {
      console.error("Error in getPaymentsWithFilters:", error);
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}
