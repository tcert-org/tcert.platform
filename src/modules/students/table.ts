import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

// Tipos generados automáticamente por Supabase
export type StudentRowType = Database["public"]["Tables"]["students"]["Row"];
export type StudentInsertType = Database["public"]["Tables"]["students"]["Insert"];

export default class StudentTable extends Table<"students"> {
  constructor() {
    super("students");
  }

  // Crear estudiante
  async createStudent(data: StudentInsertType): Promise<StudentRowType> {
    const { data: inserted, error } = await supabase
      .from("students")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("[CREATE_STUDENT_ERROR]", error.message);
      throw new Error("Error creando estudiante: " + error.message);
    }
    
    return inserted;
  }

  // Buscar estudiante por correo
  async getByEmail(email: string): Promise<StudentRowType | null> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[GET_STUDENT_EMAIL_ERROR]", error.message);
      throw new Error("Error buscando estudiante: " + error.message);
    }

    return data ?? null;
  }

  // Buscar por número de documento
  async getByDocumentNumber(document_number: string): Promise<StudentRowType | null> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("document_number", document_number)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[GET_STUDENT_DOC_ERROR]", error.message);
      throw new Error("Error buscando estudiante: " + error.message);
    }

    return data ?? null;
  }
  // Buscar estudiante por voucher_id
async getByVoucherId(voucher_id: string): Promise<StudentRowType | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("voucher_id", voucher_id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error("Error al buscar por voucher: " + error.message);
  }

  return data ?? null;
}

  
}
