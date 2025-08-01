import { NextResponse } from "next/server";
import DiplomaTable from "./table"; // Importamos la clase para manejar la tabla de diplomas
import { ApiResponse } from "@/lib/types";
import { DiplomaInsertType } from "./table"; // Usamos el tipo correcto de Supabase
//import { certificationsType } from "./type";

export default class DiplomaController {
  static async insertDiploma(
    data: DiplomaInsertType // Usamos el tipo correcto de Supabase
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const table = new DiplomaTable();

      // Validamos que los campos requeridos no sean null
      if (!data.student_id || !data.certification_id) {
        return NextResponse.json({
          statusCode: 400,
          data: null,
          error: "student_id y certification_id son requeridos.",
        });
      }

      // Verificamos si ya existe un diploma para ese estudiante y certificado
      const existingDiploma = await table.getByStudentAndCertificate(
        data.student_id,
        data.certification_id
      );

      if (existingDiploma) {
        // Si ya existe, devolvemos el diploma existente sin hacer nada
        return NextResponse.json({
          statusCode: 200,
          data: existingDiploma,
          message: "El diploma ya existe.",
        });
      }

      // Si no existe, insertamos el nuevo diploma
      const inserted = await table.insertDiploma(data); // Insertamos el diploma

      return NextResponse.json({
        statusCode: 201,
        data: inserted,
        message: "Diploma creado correctamente.",
      });
    } catch (error) {
      console.error("[INSERT_DIPLOMA_ERROR]", error);
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  static async getCertificationFromVoucher(
    data: { id: number } // Solo pasamos el id aquí
  ): Promise<NextResponse<ApiResponse<any>>> {
    try {
      const table = new DiplomaTable(); // Instancia de la tabla para interactuar con la DB
      const certification = await table.getcertificationByVoucherId(data.id); // Llamamos al método en la tabla

      if (!certification) {
        return NextResponse.json({
          statusCode: 404,
          error: "No se encontró la certificación para este voucher.",
        });
      }

      return NextResponse.json({
        statusCode: 200,
        data: certification, // Devolvemos la certificación encontrada
      });
    } catch (error) {
      console.error("[GET_CERTIFICATION_ERROR]", error);
      return NextResponse.json({
        statusCode: 500,
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
