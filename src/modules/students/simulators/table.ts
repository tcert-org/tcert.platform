import { supabase } from "@/lib/database/conection";

export default class SimulatorTable {
  async getSimulatorsByVoucherId(voucher_id: number) {
    // Obtener la certificación del voucher
    const { data, error } = await supabase
      .from("vouchers")
      .select("certification_id")
      .eq("id", voucher_id)
      .single();

    if (error || !data?.certification_id) {
      throw new Error("Certificación no encontrada desde el voucher");
    }

    // Obtener el estudiante asociado al voucher
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("voucher_id", voucher_id)
      .single();

    if (studentError) {
      throw new Error("Estudiante no encontrado para este voucher");
    }

    // Obtener simuladores de la certificación
    const { data: exams, error: examsError } = await supabase
      .from("exams")
      .select("id, name_exam, simulator, active")
      .eq("certification_id", data.certification_id)
      .eq("simulator", true)
      .eq("active", true);

    if (examsError) {
      throw new Error("Error consultando simuladores");
    }

    // Para cada simulador, verificar si el estudiante tiene intentos
    const simulatorsWithAttempts = await Promise.all(
      exams?.map(async (exam) => {
        const { data: attempts, error: attemptsError } = await supabase
          .from("exam_attempts")
          .select("id")
          .eq("exam_id", exam.id)
          .eq("student_id", student.id)
          .limit(1);

        return {
          ...exam,
          has_attempts: !attemptsError && attempts && attempts.length > 0,
        };
      }) || []
    );

    return simulatorsWithAttempts;
  }
}
