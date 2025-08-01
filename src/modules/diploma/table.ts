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
}
