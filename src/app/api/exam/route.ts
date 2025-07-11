import { NextRequest } from "next/server";
import ExamController from "@/modules/exam/controller";
import ExamMiddleware from "@/modules/exam/middleware";

export async function POST(req: NextRequest) {
  return ExamMiddleware.validateCreate(req, ExamController.createExam);
}
