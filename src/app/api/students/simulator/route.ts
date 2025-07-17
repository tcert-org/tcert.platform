import { NextResponse } from "next/server";
import { getStudentSimulators } from "@/modules/students/simulators/controller";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = Number(searchParams.get("student_id"));

  if (!studentId) {
    return NextResponse.json(
      { error: "Falta el parámetro student_id" },
      { status: 400 }
    );
  }

  const { data, error } = await getStudentSimulators(studentId);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data });
}
