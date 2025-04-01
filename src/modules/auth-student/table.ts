import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type SessionsRowType = Database["public"]["Tables"]["sessions"]["Row"];
export type SessionsInsertType =
  Database["public"]["Tables"]["sessions"]["Insert"];
export type SessionsUpdateType =
  Database["public"]["Tables"]["sessions"]["Update"];

export type StudentsRowType = Database["public"]["Tables"]["students"]["Row"];
export type StudentsInsertType =
  Database["public"]["Tables"]["students"]["Insert"];
export type StudentsUpdateType =
  Database["public"]["Tables"]["students"]["Update"];

export type VouchersRowType = Database["public"]["Tables"]["vouchers"]["Row"];
export type VouchersInsertType =
  Database["public"]["Tables"]["vouchers"]["Insert"];
export type VouchersUpdateType =
  Database["public"]["Tables"]["vouchers"]["Update"];

export type VoucherWithStudentType = VouchersRowType & {
  student?: StudentsRowType | null;
};

export class StudentLoginTable {
  async getVoucherWithStudent(token: string): Promise<VoucherWithStudentType> {
    const { data, error } = await supabase
      .from("vouchers")
      .select("*, student:student_id(*)")
      .eq("code", token)
      .maybeSingle();

    if (error) {
      console.error("[STUDENT_LOGIN_TABLE_ERROR]", error.message);
      throw new Error(error.message);
    }
    return data;
  }

  async createSession(
    sessionParams: SessionsInsertType
  ): Promise<SessionsRowType> {
    const { data, error } = await supabase
      .from("sessions")
      .insert(sessionParams)
      .select()
      .single();

    if (error) {
      console.error("[CREATE_SESSION_ERROR]", error.message);
      throw new Error(error.message);
    }
    return data;
  }
}
