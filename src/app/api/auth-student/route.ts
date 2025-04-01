import StudentController from "@/modules/auth-student/controller";
import StudentMiddleware from "@/modules/auth-student/middleware";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return StudentMiddleware.validateStudentLogin(
    req,
    StudentController.loginStudent
  );
}
