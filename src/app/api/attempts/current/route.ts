import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import ExamAttemptsTable from "@/modules/attempts/table";

export async function GET() {
  const cookieStore = await cookies();
  const attemptId = cookieStore.get("student_attempt_id")?.value;

  if (!attemptId) {
    return NextResponse.json(
      { data: null, error: "Intento no encontrado" },
      { status: 404 }
    );
  }

  const table = new ExamAttemptsTable();
  const { data, error } = await table.getExamAttemptById(Number(attemptId));

  if (error || !data) {
    return NextResponse.json(
      { data: null, error: error?.message || "No existe intento" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}
