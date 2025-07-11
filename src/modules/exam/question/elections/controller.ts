import { NextResponse } from "next/server";
import OptionsTable from "@/modules/exam/question/elections/table";
import { ApiResponse } from "@/lib/types";
import { OptionsType } from "./type";

export default class OptionsController {
  static async createOptions(
    data: OptionsType
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const optionsTable = new OptionsTable();

      const result = await optionsTable.createOptions(data);

      return NextResponse.json({
        statusCode: 201,
        data: result,
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
