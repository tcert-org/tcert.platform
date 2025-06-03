import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";

const StudentLoginSchema = z.object({
  token: z.string(),
});

export type StudentLoginType = z.infer<typeof StudentLoginSchema>;

export default class StudentMiddleware {
  static async validateStudentLogin(
    req: NextRequest,
    next: (
      data: StudentLoginType
    ) => Promise<
      NextResponse<
        | ApiResponse<null>
        | ApiResponse<{ student: string | null; hasStudent: boolean }>
      >
    >
  ): Promise<
    NextResponse<
      | ApiResponse<null>
      | ApiResponse<{ student: string | null; hasStudent: boolean }>
    >
  > {
    try {
      const body = await req.json();
      const validatedData = StudentLoginSchema.parse(body) as StudentLoginType;
      return await next(validatedData);
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
