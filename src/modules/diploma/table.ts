import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type DiplomaRowType = Database["public"]["Tables"]["diplomas"]["Row"];
export type CertifiacionRowType =
  Database["public"]["Tables"]["certifications"]["Row"];
export type DiplomaInsertType =
  Database["public"]["Tables"]["diplomas"]["Insert"];

export default class DiplomaTable extends Table<"diplomas"> {
  constructor() {
    super("diplomas");
  }

  async insertDiploma(data: DiplomaInsertType): Promise<DiplomaRowType> {
    const { data: inserted, error } = await supabase
      .from("diplomas")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("[INSERT_DIPLOMA_ERROR]", error.message);
      throw new Error("Error insertando diploma:" + error.message);
    }

    return inserted;
  }
  async getByStudentAndCertificate(
    student_id: number,
    certification_id: number
  ): Promise<DiplomaRowType | null> {
    const { data, error } = await supabase
      .from("diplomas")
      .select("*")
      .eq("student_id", student_id)
      .eq("certification_id", certification_id)
      .maybeSingle();

    if (error) {
      console.error("[GET_DIPLOMA_ERROR]", error.message);
      throw new Error("Error al obtener el diploma.");
    }

    return data;
  }

  async getcertificationByVoucherId(
    voucher_id: number
  ): Promise<CertifiacionRowType | null> {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .eq("voucher_id", voucher_id)
      .maybeSingle();

    if (error) {
      console.error("[GET_CERTIFICATION_ERROR]", error.message);
      throw new Error("Error al obtener la certificación.");
    }

    return data;
  }

  async getDiplomaAndStudentByVoucherCode(code: string): Promise<any> {
    // Paso 1: Obtener el voucher por código
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (voucherError) {
      console.error("[GET_VOUCHER_BY_CODE_ERROR]", voucherError.message);
      throw new Error("Error al obtener el voucher por código.");
    }

    if (!voucher) {
      return null; // No existe el voucher
    }

    // Paso 2: Obtener el estudiante asociado al voucher
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(
        `
        id,
        fullname,
        email,
        document_type,
        document_number,
        voucher_id
      `
      )
      .eq("voucher_id", voucher.id)
      .maybeSingle();

    if (studentError) {
      console.error("[GET_STUDENT_BY_VOUCHER_ERROR]", studentError.message);
      throw new Error("Error al obtener el estudiante por voucher.");
    }

    if (!student) {
      return null; // No existe estudiante para este voucher
    }

    // Paso 3: Obtener el diploma del estudiante con información de certificación
    const { data: diploma, error: diplomaError } = await supabase
      .from("diplomas")
      .select(
        `
        id,
        student_id,
        certification_id
      `
      )
      .eq("student_id", student.id)
      .maybeSingle();

    if (diplomaError) {
      console.error("[GET_DIPLOMA_BY_STUDENT_ERROR]", diplomaError.message);
      throw new Error("Error al obtener el diploma del estudiante.");
    }

    // Paso 4: Si existe diploma, obtener información de la certificación
    let certification = null;
    if (diploma && diploma.certification_id) {
      const { data: certData, error: certError } = await supabase
        .from("certifications")
        .select(
          `
          id,
          name
        `
        )
        .eq("id", diploma.certification_id)
        .maybeSingle();

      if (certError) {
        console.error("[GET_CERTIFICATION_ERROR]", certError.message);
        throw new Error("Error al obtener la certificación.");
      }

      certification = certData;
    }

    // Retornar toda la información combinada
    return {
      voucher: {
        id: voucher.id,
        code: code,
      },
      student: student,
      diploma: diploma,
      certification: certification,
    };
  }
}
