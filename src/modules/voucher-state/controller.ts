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
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  // Nuevo método para actualizar usando slug
  static async updateVoucherStateBySlug(
    voucherId: number,
    statusSlug: string,
    isUsed: boolean
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const table = new VoucherStateTable();

      // Primero obtenemos el ID del status usando el slug
      const statusId = await table.getStatusIdBySlug(statusSlug);

      if (!statusId) {
        return NextResponse.json({
          statusCode: 404,
          data: null,
          error: `Status con slug '${statusSlug}' no encontrado`,
        });
      }

      const updated = await table.updateStateVoucher(
        voucherId,
        statusId,
        isUsed
      );

      return NextResponse.json({
        statusCode: 200,
        data: updated,
      });
    } catch (error) {
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
      const table = new VoucherStateTable();
      const voucherState = await table.getVoucherState(voucherId);

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
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  // Nuevo método para obtener todos los statuses
  static async getAllStatuses(): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const table = new VoucherStateTable();
      const statuses = await table.getAllStatuses();

      return NextResponse.json({
        statusCode: 200,
        data: statuses,
      });
    } catch (error) {
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
