import { NextResponse } from "next/server";
import type { StudentLoginType } from "./middleware";
import { StudentLoginService } from "./service";
import { ApiResponse } from "@/lib/types";

export default class StudentController {
  static async loginStudent({
    token,
  }: StudentLoginType): Promise<
    NextResponse<
      | ApiResponse<null>
      | ApiResponse<{ student: string | null; hasStudent: boolean }>
    >
  > {
    const studentLoginService = new StudentLoginService();

    try {
      const result = await studentLoginService.processToken(token);

      if (!result.session) {
        return NextResponse.json(
          {
            statusCode: 401,
            data: null,
            error: "Unauthorized: Invalid or missing session token",
          },
          { status: 401 }
        );
      }

      const response = NextResponse.json(
        {
          statusCode: 200,
          data: {
            student: result.student,
            hasStudent: result.hasStudent,
          },
        },
        { status: 200 }
      );

      response.cookies.set("student_access_token", result.session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return response;
    } catch (error: any) {
      return NextResponse.json(
        {
          statusCode: 500,
          data: null,
          error:
            "Internal Server Error: " + (error?.message || "Unknown error"),
        },
        { status: 500 }
      );
    }
  }
}
