import { supabase } from "@/lib/database/conection";
import { SimulatorType } from "./type";

export async function getStudentSimulators(studentId: number): Promise<{
  data: SimulatorType[] | null;
  error: any;
}> {
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      `
      voucher_id,
      vouchers:voucher_id (
        certification_id
      )
    `
    )
    .eq("id", studentId)
    .single();

  const certificationId = student?.vouchers?.[0]?.certification_id;

  if (studentError || !certificationId) {
    return {
      data: null,
      error: studentError || "Certificación no encontrada para el estudiante",
    };
  }

  const { data: simulators, error: simError } = await supabase
    .from("exams")
    .select("id, name_exam, simulator, active, certification_id")
    .eq("certification_id", certificationId)
    .eq("simulator", true);

  return { data: simulators, error: simError };
}
