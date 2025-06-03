// src/app/api/students/route.ts
import { NextRequest } from "next/server";
import StudentMiddleware from "@/modules/students/middleware";
import StudentController from "@/modules/students/controller";

export async function POST(req: NextRequest) {
  return StudentMiddleware.validateCreate(req, StudentController.createStudent);
}
