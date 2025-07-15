import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type ExamRowType = Database["public"]["Tables"]["exams"]["Row"];
export type ExamInsertType = Database["public"]["Tables"]["exams"]["Insert"];

export default class ExamTable extends Table<"exams"> {
  constructor() {
    super("exams");
  }

  //Crear examen
  async createExam(data: ExamInsertType): Promise<ExamRowType> {
    const { data: inserted, error } = await supabase
      .from("exams")
      .insert(data)
      .select()
      .single();
    if (error) {
      console.error("[CREATE_EXAMS_ERROR]", error.message);
      throw new Error("Error creando examen: " + error.message);
    }
    return inserted;
  }

  //Buscar examen por nombre

  async getbyname(name_exam: string): Promise<ExamRowType | null> {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("name_exam", name_exam)
      .single();

    if (error && error.code != "PGRST116") {
      console.error("[GET_EXAM_NAME_EXAM_ERROR]", error.message);
      throw new Error("Error buscando exam: " + error.message);
    }
    return data ?? null;
  }
  async getAllExams(): Promise<{
    data: ExamRowType[] | null;
    error: any;
  }> {
    const { data, error } = await supabase.from("exams").select(`
      id,
      name_exam,
      simulator,
      time_limit,
      attempts,
      active,
      certification_id,
      certifications ( name )
    `);

    if (error) return { data: null, error };

    // Transformamos la data para extraer certification_name
    const mappedData = data?.map((exam: any) => ({
      ...exam,
      certification_name: exam.certifications?.name ?? "Sin nombre",
    }));

    return { data: mappedData, error: null };
  }
}
