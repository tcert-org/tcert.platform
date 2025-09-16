import { NextRequest, NextResponse } from "next/server";
import PaymentTable from "@/modules/payments/table";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerIdRaw = searchParams.get("partner_id");

    if (!partnerIdRaw) {
      return NextResponse.json(
        { error: "Falta el parámetro 'partner_id'" },
        { status: 400 }
      );
    }

    const partner_id = parseInt(partnerIdRaw, 10);
    if (isNaN(partner_id)) {
      return NextResponse.json(
        { error: "'partner_id' debe ser un número válido" },
        { status: 400 }
      );
    }

    // Construir los parámetros como lo hacía la implementación original
    const query: Record<string, any> = {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit_value: parseInt(searchParams.get("limit_value") || "10", 10),
      order_by: searchParams.get("order_by") || "created_at",
      order_dir: searchParams.get("order_dir") || "desc",
    };

    // Agregar filtros existentes
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("filter_") && value) {
        query[key] = value;
      }
    }

    const table = new PaymentTable();

    // Usar el método simple de filtro por partner y luego aplicar paginación manualmente
    const allPartnerPayments = await table.getPaymentsByPartner(
      partner_id.toString()
    );

    // Aplicar filtros manualmente si existen
    let filteredData = allPartnerPayments;

    // Helper function para extraer solo la fecha (YYYY-MM-DD) de un string o Date
    const extractDateOnly = (dateInput: string | Date): string => {
      let date: Date;

      if (typeof dateInput === "string") {
        date = new Date(dateInput);
      } else {
        date = dateInput;
      }

      // Extraer solo la parte de fecha en formato YYYY-MM-DD
      return date.toISOString().split("T")[0];
    };

    // Filtro por fecha de creación
    if (query.filter_created_at) {
      const filterDateStr = extractDateOnly(query.filter_created_at);
      const filterOp = query.filter_created_at_op || "=";

      filteredData = filteredData.filter((item) => {
        const itemDateStr = extractDateOnly(item.created_at);

        switch (filterOp) {
          case ">=":
            return itemDateStr >= filterDateStr;
          case "<=":
            return itemDateStr <= filterDateStr;
          case "=":
            return itemDateStr === filterDateStr;
          case ">":
            return itemDateStr > filterDateStr;
          case "<":
            return itemDateStr < filterDateStr;
          default:
            return true;
        }
      });
    }

    // Filtro por precio total
    if (query.filter_total_price) {
      const filterPrice = parseFloat(query.filter_total_price);
      const filterOp = query.filter_total_price_op || "=";

      filteredData = filteredData.filter((item) => {
        const itemPrice = parseFloat(item.total_price);
        switch (filterOp) {
          case ">=":
            return itemPrice >= filterPrice;
          case "<=":
            return itemPrice <= filterPrice;
          case "=":
            return itemPrice === filterPrice;
          case ">":
            return itemPrice > filterPrice;
          case "<":
            return itemPrice < filterPrice;
          default:
            return true;
        }
      });
    }

    // Filtro por cantidad de vouchers
    if (query.filter_voucher_quantity) {
      const filterQuantity = parseInt(query.filter_voucher_quantity);
      const filterOp = query.filter_voucher_quantity_op || "=";

      filteredData = filteredData.filter((item) => {
        const itemQuantity = parseInt(item.voucher_quantity);
        switch (filterOp) {
          case ">=":
            return itemQuantity >= filterQuantity;
          case "<=":
            return itemQuantity <= filterQuantity;
          case "=":
            return itemQuantity === filterQuantity;
          case ">":
            return itemQuantity > filterQuantity;
          case "<":
            return itemQuantity < filterQuantity;
          default:
            return true;
        }
      });
    }

    // Filtro por precio unitario
    if (query.filter_unit_price) {
      const filterPrice = parseFloat(query.filter_unit_price);
      const filterOp = query.filter_unit_price_op || "=";

      filteredData = filteredData.filter((item) => {
        const itemPrice = parseFloat(item.unit_price);
        switch (filterOp) {
          case ">=":
            return itemPrice >= filterPrice;
          case "<=":
            return itemPrice <= filterPrice;
          case "=":
            return itemPrice === filterPrice;
          case ">":
            return itemPrice > filterPrice;
          case "<":
            return itemPrice < filterPrice;
          default:
            return true;
        }
      });
    }

    // Filtro por fecha de vencimiento
    if (query.filter_expiration_date) {
      const filterDateStr = extractDateOnly(query.filter_expiration_date);
      const filterOp = query.filter_expiration_date_op || "=";

      filteredData = filteredData.filter((item) => {
        if (!item.expiration_date) return false;
        const itemDateStr = extractDateOnly(item.expiration_date);

        switch (filterOp) {
          case ">=":
            return itemDateStr >= filterDateStr;
          case "<=":
            return itemDateStr <= filterDateStr;
          case "=":
            return itemDateStr === filterDateStr;
          case ">":
            return itemDateStr > filterDateStr;
          case "<":
            return itemDateStr < filterDateStr;
          default:
            return true;
        }
      });
    }

    // Filtro por fecha de extensión
    if (query.filter_extension_date) {
      const filterDateStr = extractDateOnly(query.filter_extension_date);
      const filterOp = query.filter_extension_date_op || "=";

      filteredData = filteredData.filter((item) => {
        if (!item.extension_date) return false;
        const itemDateStr = extractDateOnly(item.extension_date);

        switch (filterOp) {
          case ">=":
            return itemDateStr >= filterDateStr;
          case "<=":
            return itemDateStr <= filterDateStr;
          case "=":
            return itemDateStr === filterDateStr;
          case ">":
            return itemDateStr > filterDateStr;
          case "<":
            return itemDateStr < filterDateStr;
          default:
            return true;
        }
      });
    }

    // Aplicar ordenamiento
    filteredData.sort((a, b) => {
      const orderBy = query.order_by;
      const orderDir = query.order_dir;

      let aVal = a[orderBy];
      let bVal = b[orderBy];

      // Convertir fechas y números para ordenamiento correcto
      if (orderBy.includes("date") || orderBy === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (orderBy.includes("price") || orderBy === "voucher_quantity") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (orderDir === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Aplicar paginación
    const totalCount = filteredData.length;
    const startIndex = (query.page - 1) * query.limit_value;
    const endIndex = startIndex + query.limit_value;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedData,
      meta: { totalCount },
    });
  } catch (error) {
    console.error("[PAYMENTS_DETAILS_PARTNER_ERROR]", error);
    return NextResponse.json(
      { error: "Error al obtener pagos del partner" },
      { status: 500 }
    );
  }
}
