import { NextResponse } from "next/server";
import {
  PartnerForDetail,
  PartnerInsertType,
  PartnerRowType,
  PartnerUpdateType,
} from "./table";
import { ApiResponse } from "@/lib/types";
import PartnerService from "./service";

export default class PartnerController {
  static async getById(
    id: number
  ): Promise<NextResponse<ApiResponse<PartnerForDetail>>> {
    try {
      const result = await PartnerService.getPartnerById(id);
      if (!result) {
        return NextResponse.json(
          { statusCode: 404, data: null, error: "Partner not found." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { statusCode: 200, data: result },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          statusCode: 500,
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  static async getAll(): Promise<NextResponse<ApiResponse<PartnerRowType[]>>> {
    try {
      const result = await PartnerService.getAllPartners();
      return NextResponse.json(
        { statusCode: 200, data: result },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          statusCode: 500,
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  static async create(
    data: PartnerInsertType
  ): Promise<NextResponse<ApiResponse<PartnerRowType>>> {
    try {
      const result = await PartnerService.create(data);
      return NextResponse.json(
        { statusCode: 201, data: result },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          statusCode: 500,
          data: null,
          error: `Internal server error: ${error}`,
        },
        { status: 500 }
      );
    }
  }

  static async update(
    id: number,
    data: PartnerUpdateType
  ): Promise<NextResponse<ApiResponse<PartnerRowType>>> {
    try {
      const result = await PartnerService.update(id, data);
      return NextResponse.json(
        { statusCode: 201, data: result },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          statusCode: 500,
          data: null,
          error: `Internal server error: ${error}`,
        },
        { status: 500 }
      );
    }
  }
}
