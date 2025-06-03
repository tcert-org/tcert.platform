// src/modules/students/middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StudentInsertType } from "./types";
import { StudentLoginTable } from "../auth-student/table";

// Schema de validación para crear estudiante
const createStudentSchema = z.object({
  fullname: z.string().min(2, "Nombre demasiado corto"),
  document_number: z.string().min(5, "Documento inválido"),
  document_type: z.string().min(1, "Tipo de documento requerido"),
  email: z.string().email("Email inválido"),
  voucher_id: z.string()
});

export default class StudentMiddleware {
  static async validateCreate(
    req: NextRequest,
    next: (data: StudentInsertType, req: NextRequest) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const studentLoginTable = new StudentLoginTable();
      const token=req.cookies.get("student_access_token")?.value;
      console.log("*Token:", token);
      if(token){
        
        const payload = await studentLoginTable.decodeStudentJWT(token);
        body.email = payload?.email;
        body.voucher_id = payload?.voucher_id;
        console.log("*body:", body);
      }
      const validatedData = createStudentSchema.parse(body) as StudentInsertType;
      return next(validatedData, req);
    } catch (error) {
      console.error("Validation Error (create student):", error);
      return NextResponse.json(
        {
          statusCode: 400,
          data: null,
          error: `Invalid request data: ${error instanceof Error ? error.message : String(error)}`,
        },
        { status: 400 }
      );
    }
  }
}

