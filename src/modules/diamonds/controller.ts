import { NextResponse } from "next/server";
import DiamondUsers, { DiamondUserData } from "./table";
import { ApiResponse } from "@/lib/types";

const diamondUsers = new DiamondUsers();

export default class DiamondController {
  /**
   * Get all diamond users (users with membership_id = 4)
   * @returns Promise<NextResponse<ApiResponse<DiamondUserData[]>>>
   */
  static async getAll(): Promise<NextResponse<ApiResponse<DiamondUserData[]>>> {
    try {
      const result = await diamondUsers.getDiamondUsers();
      return NextResponse.json(
        { statusCode: 200, data: result },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error in DiamondController.getAll:", error);
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

  /**
   * Get a specific diamond user by ID
   * @param id - The user ID
   * @returns Promise<NextResponse<ApiResponse<DiamondUserData | null>>>
   */
  static async getById(
    id: number
  ): Promise<NextResponse<ApiResponse<DiamondUserData | null>>> {
    try {
      // Validate ID
      if (!id || id <= 0) {
        return NextResponse.json(
          {
            statusCode: 400,
            data: null,
            error: "Invalid user ID provided",
          },
          { status: 400 }
        );
      }

      const result = await diamondUsers.getDiamondUserById(id);

      if (!result) {
        return NextResponse.json(
          {
            statusCode: 404,
            data: null,
            error: "Diamond user not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { statusCode: 200, data: result },
        { status: 200 }
      );
    } catch (error) {
      console.error(`Error in DiamondController.getById(${id}):`, error);
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
