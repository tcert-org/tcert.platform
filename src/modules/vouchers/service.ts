import VoucherTable from "./table";
import { FilterParamsVoucher, CreateParamsVoucher } from "./types";
import { supabase } from "@/lib/database/conection";

export default class VoucherService {
  static async getVouchersWithFilters(params: FilterParamsVoucher) {
    const voucherTable = new VoucherTable();
    return await voucherTable.getVouchersForTable(params);
  }

  static async createVoucher(data: CreateParamsVoucher) {
    const {
      partner_id,
      certification_id = null,
      status_id,
      email,
      expiration_dates,
      used = false,
    } = data;

    console.log("[DEBUG] Datos recibidos desde frontend:", data);

    let expiration_date = expiration_dates;

    // ✅ Solo si no viene la fecha desde el frontend, calcularla según params
    if (!expiration_date) {
      try {
        const { data: param, error } = await supabase
          .from("params")
          .select("value")
          .eq("id", 6)
          .single();

        if (error) {
          console.warn("[WARNING_PARAM_EXPIRATION]", error.message);
        }

        console.log("[DEBUG] Resultado de param (id=6):", param);
        console.log("[DEBUG] Tipo de param.value:", typeof param?.value);

        if (typeof param?.value === "number" && param.value > 0) {
          // Usar la fecha actual como base para el cálculo
          const purchaseDate = new Date();

          // Calcular la fecha de vencimiento preservando el día
          const expirationDate = new Date(purchaseDate);
          expirationDate.setMonth(purchaseDate.getMonth() + param.value);

          // Si el día se ajustó automáticamente (ej: 31 enero → 2-3 marzo),
          // ajustar al último día del mes correcto
          if (expirationDate.getDate() !== purchaseDate.getDate()) {
            expirationDate.setDate(0); // Va al último día del mes anterior
          }

          expiration_date = expirationDate.toISOString();
          console.log("[DEBUG] Fecha de compra:", purchaseDate.toISOString());
          console.log("[DEBUG] Meses a agregar:", param.value);
          console.log(
            "[DEBUG] Fecha de expiración calculada:",
            expiration_date
          );
        } else {
          throw new Error("Parámetro 'value' inválido o no definido");
        }
      } catch (e) {
        console.error("[ERROR_LOADING_EXPIRATION_PARAM]", e);
        throw new Error("No se pudo calcular la fecha de expiración");
      }
    } else {
      console.log(
        "[DEBUG] Usando fecha de expiración desde frontend:",
        expiration_date
      );
    }

    const voucherData = {
      partner_id: Number(partner_id),
      certification_id: certification_id ? Number(certification_id) : null,
      status_id: status_id ? Number(status_id) : null,
      email,
      expiration_date,
      used,
    };

    console.log(
      "[DEBUG] Datos finales que se insertarán en vouchers:",
      voucherData
    );

    const voucherTable = new VoucherTable();
    return await voucherTable.createVoucher(voucherData);
  }
}
