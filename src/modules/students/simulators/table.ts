import { supabase } from "@/lib/database/conection";

export default class SimulatorTable {
  async getSimulatorsByVoucherId(voucher_id: number) {
    const { data, error } = await supabase
      .from("vouchers")
      .select("certification_id")
      .eq("id", voucher_id)
      .single();

    if (error || !data?.certification_id) {
      throw new Error("Certificación no encontrada desde el voucher");
    }

    const { data: exams, error: examsError } = await supabase
      .from("exams")
      .select("id, name_exam, simulator, active")
      .eq("certification_id", data.certification_id)
      .eq("simulator", true)
      .eq("active", true);

    if (examsError) {
      throw new Error("Error consultando simuladores");
    }

    return exams;
  }
}
