import { NextRequest, NextResponse } from "next/server";
import {
  roles_InsertSchema,
  roles_UpdateSchema,
} from "@/lib/database/database.schemas";
import { RoleInsertType, RoleUpdateType } from "./table";

export default class RoleMiddleware {
  static async validatePost(
    req: NextRequest,
    next: (data: RoleInsertType) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = roles_InsertSchema.parse(body) as RoleInsertType;
      return next(validatedData);
    } catch (error) {
      return NextResponse.json(
        {
          statusCode: 400,
          data: null,
          error: `Invalid request data: ${error}`,
        },
        { status: 400 }
      );
    }
  }

  static async validatePut(
    req: NextRequest,
    id: number,
    next: (id: number, data: RoleUpdateType) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = roles_UpdateSchema.parse(body) as RoleUpdateType;
      return next(id, validatedData);
    } catch (error) {
      return NextResponse.json(
        {
          statusCode: 400,
          data: null,
          error: `Invalid request data: ${error}`,
        },
        { status: 400 }
      );
    }
  }
}
