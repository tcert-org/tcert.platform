import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";
import { CertificationMaterialRespose } from "./types";

export type VoucherRowType = Database["public"]["Tables"]["vouchers"]["Row"];

export default class MaterialTable extends Table<"vouchers"> {
  constructor() {
    super("vouchers");
  }

  // Obtener material de estudio desde el voucher_id
  async getMaterialByVoucherId(voucher_id: number): Promise<string | null> {
    const { data, error } = await supabase
      .from("vouchers")
      .select("certification:certification_id (study_material_url)")
      .eq("id", voucher_id)
      .single<CertificationMaterialRespose>();

    if (error) {
      console.error("[GET_MATERIAL_ERROR]", error.message);
      throw new Error("Error consultando material: " + error.message);
    }

    return data?.certification?.study_material_url ?? null;
  }
}
