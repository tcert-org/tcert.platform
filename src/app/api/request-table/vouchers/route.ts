import { NextRequest, NextResponse } from "next/server";
import VoucherTable from "@/modules/vouchers/table";
import VoucherController from "@/modules/vouchers/controller";
import VoucherMiddleware from "@/modules/vouchers/middleware";

// POST: Crear voucher (con validación)
export async function POST(req: NextRequest) {
  return VoucherMiddleware.validateCreate(req, VoucherController.createVoucher);
}

// GET: Listar vouchers con filtros y paginación, o por ID
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    const voucherTable = new VoucherTable();

    // Si viene un ID, busca solo ese voucher (puedes implementar esto si quieres)
    if (idParam) {
      const id = parseInt(idParam);
      if (isNaN(id)) {
        return NextResponse.json(
          { message: "El parámetro 'id' debe ser un número válido" },
          { status: 400 }
        );
      }
      const { data, error } = await voucherTable.getVoucherById(id);
      if (error || !data) {
        return NextResponse.json(
          { message: error?.message || "Voucher no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(data, { status: 200 });
    }

    // Si no hay id, usar filtros/paginación por query params
    const params = Object.fromEntries(url.searchParams.entries());

    // Llama el método paginado
    const result = await voucherTable.getVouchersForTable(params);

    if (!result) {
      return NextResponse.json(
        { message: "Error obteniendo vouchers" },
        { status: 500 }
      );
    }

    // El frontend espera { data, totalCount }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
