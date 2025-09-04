import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";
import { FilterParamsExam } from "./types";
export type ExamRowType = Database["public"]["Tables"]["exams"]["Row"];
export type ExamInsertType = Database["public"]["Tables"]["exams"]["Insert"];
type ExamRowWithCount = ExamRowType & { total_count: number };
export default class ExamTable extends Table<"exams"> {
  constructor() {
    super("exams");
  }
  async getExamsForTable(
    filters: FilterParamsExam
  ): Promise<{ data: ExamRowType[]; totalCount: number } | null> {
    try {
      const {
        filter_name_exam,
        filter_certification_id,
        filter_simulator,
        filter_active,
        filter_created_at,
        filter_created_at_op,
        order_by = "created_at",
        order_dir = "desc",
        page = 1,
        limit_value = 10,
      } = filters;

      if (!["asc", "desc"].includes(order_dir.toLowerCase())) {
        throw new Error("Invalid order_dir. Must be 'asc' or 'desc'.");
      }

      if (page <= 0 || limit_value <= 0) {
        throw new Error("Pagination values must be greater than 0.");
      }

      console.log("🔍 Table filters received:", {
        filter_name_exam,
        filter_certification_id,
        filter_simulator,
        filter_active,
        filter_created_at,
        filter_created_at_op,
      }); // Debug log

      const { data, error } = await supabase.rpc("get_exams_with_filters", {
        filter_name_exam: filter_name_exam ?? null,
        filter_certification_id: filter_certification_id
          ? Number(filter_certification_id)
          : null,
        filter_certification_name:
          (filters as any).filter_certification_name ?? null, // 👈 NUEVO
        filter_simulator:
          typeof filter_simulator === "boolean" ? filter_simulator : null,
        filter_active:
          typeof filter_active === "boolean" ? filter_active : null,
        filter_created_at: filter_created_at
          ? new Date(filter_created_at).toISOString().split("T")[0]
          : null,
        filter_created_at_op: filter_created_at_op ?? ">=",
        order_by: order_by ?? "created_at",
        order_dir: order_dir ?? "desc",
        page: page ?? 1,
        limit_value: limit_value ?? 10,
      });

      if (error) {
        console.error("ERROR SUPABASE:", error);
        throw new Error(`Error getting exams: ${error.message}`);
      }

      const rows = data as ExamRowWithCount[];

      return {
        data: rows.map(({ total_count, ...rest }) => rest),
        totalCount: rows[0]?.total_count ?? 0,
      };
    } catch (error: any) {
      console.error("Error in getExamsForTable:", error.message);
      return null;
    }
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

  //Traemos todos los examenes para listarlos
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

  //Obtener un examen por su ID
  async getExamById(id: number) {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  }

  //Actualizar nombre examen
  async updateExamName(id: number, name_exam: string) {
    const { data, error } = await supabase
      .from("exams")
      .update({ name_exam })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  }

  //Actualizar estado activo/inactivo examen
  async updateExamActive(id: number, active: boolean) {
    const { data, error } = await supabase
      .from("exams")
      .update({ active })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  }

  //Nombre examen
  async getExamNameById(id: number) {
    const { data, error } = await supabase
      .from("exams")
      .select("name_exam")
      .eq("id", id)
      .single();

    return { data, error };
  }
}
