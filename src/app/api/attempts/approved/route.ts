import { NextRequest, NextResponse } from "next/server";
import AttemptService from "@/modules/attempts/service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");

    if (!studentId) {
      return NextResponse.json(
        {
          statusCode: 400,
          data: null,
          error: "student_id is required",
        },
        { status: 400 }
      );
    }

    const attemptService = new AttemptService();

    // Obtener todos los intentos aprobados del estudiante
    const approvedAttempts = await attemptService.getApprovedAttempts(
      parseInt(studentId)
    );

    return NextResponse.json(
      {
        statusCode: 200,
        data: {
          hasApprovedAttempts: approvedAttempts.length > 0,
          approvedAttempts: approvedAttempts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking approved attempts:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        data: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
