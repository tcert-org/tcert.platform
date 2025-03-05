import { NextResponse } from "next/server";
import { RoleInsertType, RoleRowType, RoleUpdateType } from "./table";
import { ApiResponse } from "@/lib/types";
import RoleService from "./service";

export default class RoleController {
  static async getById(
    id: number
  ): Promise<NextResponse<ApiResponse<RoleRowType>>> {
    try {
      const result = await RoleService.getRoleById(id);
      if (!result) {
        return NextResponse.json(
          { statusCode: 404, data: null, error: "Role not found." },
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

  static async getAll(): Promise<NextResponse<ApiResponse<RoleRowType[]>>> {
    try {
      const result = await RoleService.getAllRoles();
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
    data: RoleInsertType
  ): Promise<NextResponse<ApiResponse<RoleRowType>>> {
    try {
      const result = await RoleService.create(data);
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
    data: RoleUpdateType
  ): Promise<NextResponse<ApiResponse<RoleRowType>>> {
    try {
      const result = await RoleService.update(id, data);
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
  static async deleteRole(
    id: number
  ): Promise<NextResponse<ApiResponse<null>>> {
    try {
      const success = await RoleService.deleteRole(id);
      if (!success) {
        return NextResponse.json(
          { statusCode: 404, data: null, error: "Role not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { statusCode: 200, data: null },
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
}
