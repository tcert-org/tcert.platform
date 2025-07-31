import { NextResponse } from "next/server";
import VoucherStateTable from "@/modules/voucher-state/table"; // Asegúrate de tener la importación correcta
import { ApiResponse } from "@/lib/types";

export default class VoucherStateController {
  static async updateVoucherState(
    voucherId: number,
    newStatusId: number,
    isUsed: boolean
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const table = new VoucherStateTable();
      const updated = await table.updateStateVoucher(
        voucherId,
        newStatusId,
        isUsed
      ); // Método para actualizar el estado
      return NextResponse.json({
        statusCode: 200,
        data: updated,
      });
    } catch (error) {
      console.error("[UPDATE_VOUCHER_STATE_ERROR]", error);
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
  static async getVoucherState(
    voucherId: number
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      console.log("📥 Consultando el estado del voucher:", voucherId);

      const table = new VoucherStateTable();
      const voucherState = await table.getVoucherState(voucherId); // Llamamos al método para obtener el estado

      if (!voucherState) {
        return NextResponse.json({
          statusCode: 404,
          data: null,
          error: "Voucher no encontrado.",
        });
      }

      return NextResponse.json({
        statusCode: 200,
        data: voucherState,
      });
    } catch (error) {
      console.error("[GET_VOUCHER_STATE_ERROR]", error);
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
