// src/modules/students/controller.ts
import { NextResponse } from "next/server";
import StudentTable from "@/modules/students/table";
import { ApiResponse } from "@/lib/types";
import { StudentInsertType } from "./types";

export default class StudentController {
  static async createStudent(
    data: StudentInsertType
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const studentTable = new StudentTable();

      const existingByDocument = await studentTable.getByDocumentNumber(
        data.document_number
      );
      if (existingByDocument) {
        return NextResponse.json({
          statusCode: 400,
          data: null,
          error: "Ya existe un estudiante con este número de documento",
        });
      }

      const result = await studentTable.createStudent(data);

      return NextResponse.json({
        statusCode: 201,
        data: result,
      });
    } catch (error) {
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  static async getStudentByEmail(
    email: string
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const studentTable = new StudentTable();
      const result = await studentTable.getByEmail(email);

      if (!result) {
        return NextResponse.json({
          statusCode: 404,
          data: null,
          error: "Estudiante no encontrado",
        });
      }

      return NextResponse.json({
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
