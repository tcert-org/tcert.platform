import { NextRequest } from "next/server";
import QuestionController from "@/modules/exam/question/controller";
import QuestionMiddleware from "@/modules/exam/question/middleware";

export async function POST(req: NextRequest) {
  return QuestionMiddleware.validateQuestion(
    req,
    QuestionController.createQuestion
  );
}
