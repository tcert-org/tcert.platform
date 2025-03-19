import { NextRequest, NextResponse } from "next/server";
import {
  users_InsertSchema,
  users_UpdateSchema,
} from "@/lib/database/database.schemas";
import { PartnerInsertType, PartnerUpdateType } from "./table";

export default class PartnerMiddleware {
  static async validatePost(
    req: NextRequest,
    next: (data: PartnerInsertType) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = users_InsertSchema.parse(body) as PartnerInsertType;
      return next(validatedData);
    } catch (error) {
      console.log(error);
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
    next: (id: number, data: PartnerUpdateType) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = users_UpdateSchema.parse(body) as PartnerUpdateType;
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
