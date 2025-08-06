import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";
import { jwtVerify } from "jose";

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
//TODO: VoucherWithStudentType
export class StudentLoginTable {
  async getVoucherWithStudent(code: string): Promise<any> {
    const { data, error } = await supabase
      .from("vouchers")
      .select(`
        *,
        students:students(voucher_id, fullname, document_number, document_type)
      `)
      .eq("code", code)
      .maybeSingle();

    if (error) {
      console.error("[STUDENT_LOGIN_TABLE_ERROR]", error.message);
      throw new Error(error.message);
    }
    return data;
  }

  async createSession(
    sessionParams: any //TODO: SessionsInsertType
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

  async validateSession(
    sessionToken: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[VALIDATE_SESSION_ERROR]", error.message);
        return false;
      }

      if (!data) {
        return false;
      }

      const sessionCreatedAt = new Date(data.created_at);
      const now = new Date();
      const hoursSinceCreation =
        (now.getTime() - sessionCreatedAt.getTime()) / (1000 * 60 * 60);

      return hoursSinceCreation < 24;
    } catch (error) {
      console.error("[VALIDATE_SESSION_ERROR]", error);
      return false;
    }
  }

  async decodeStudentJWT(token: string) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      return payload;
    } catch (error) {
      console.error("[DECODE_JWT_ERROR]", error);
      return null;
    }
  }
}
