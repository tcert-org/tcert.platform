import { NextRequest, NextResponse } from "next/server";
import ExamController from "@/modules/exam/controller";
import ExamMiddleware from "@/modules/exam/middleware";
import ExamTable from "@/modules/exam/table";
export async function POST(req: NextRequest) {
  return ExamMiddleware.validateCreate(req, ExamController.createExam);
}

export async function GET() {
  try {
    const examTable = new ExamTable();
    const { data, error } = await examTable.getAllExams();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error obteniendo exámenes" },
      { status: 500 }
    );
  }
}
