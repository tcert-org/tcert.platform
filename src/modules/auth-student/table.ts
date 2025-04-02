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

  async validateSession(
    voucherId: string,
    voucherCode: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("voucher_id", voucherId)
        .eq("voucher_code", voucherCode)
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

      return {
        voucher_id: payload.voucher_id as string,
        code: payload.code as string,
        role: payload.role as string,
        certification_id: payload.certification_id as string | null,
      };
    } catch (error) {
      console.error("[DECODE_JWT_ERROR]", error);
      return null;
    }
  }
}
