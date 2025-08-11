import { SignJWT } from "jose";
import CryptoJS from "crypto-js";
import { StudentLoginTable } from "./table";
import VoucherStateTable from "@/modules/voucher-state/table";

const studentLoginTable = new StudentLoginTable();
const voucherStateTable = new VoucherStateTable();

export class StudentLoginService {
  async processToken(token: string): Promise<{
    student: string | null;
    session: string | null;
    hasStudent: boolean;
    error?: string;
  }> {
    try {
      const voucherWithStudent = await studentLoginTable.getVoucherWithStudent(
        token
      );

      if (!voucherWithStudent) {
        return {
          student: null,
          session: null,
          hasStudent: false,
          error: "VOUCHER_NOT_FOUND",
        };
      }

      // Verificar si el voucher está vencido
      if (
        voucherWithStudent?.expiration_date &&
        new Date(voucherWithStudent.expiration_date) < new Date()
      ) {
        // Actualizar el estado del voucher a "vencido" solo si no está ya en ese estado
        try {
          const statusId = await voucherStateTable.getStatusIdBySlug("vencido");
          if (statusId && voucherWithStudent.status_id !== statusId) {
            await voucherStateTable.updateStateVoucher(
              voucherWithStudent.id,
              statusId,
              voucherWithStudent.used || false
            );
          }
        } catch (updateError) {
          console.error(
            "Error al actualizar estado de voucher vencido:",
            updateError
          );
          // No bloqueamos el login por este error, pero lo registramos
        }

        return {
          student: null,
          session: null,
          hasStudent: false,
          error: "VOUCHER_EXPIRED",
        };
      }

      // Verificar si el voucher ya fue utilizado (aprobado o reprobado)
      try {
        const aprobadoStatusId = await voucherStateTable.getStatusIdBySlug(
          "aprobado"
        );
        const perdidoStatusId = await voucherStateTable.getStatusIdBySlug(
          "perdido"
        );

        if (
          voucherWithStudent.status_id === aprobadoStatusId ||
          voucherWithStudent.status_id === perdidoStatusId
        ) {
          return {
            student: null,
            session: null,
            hasStudent: false,
            error: "VOUCHER_ALREADY_USED",
          };
        }
      } catch (statusError) {
        console.error("Error al verificar estado del voucher:", statusError);
        // Continuamos con el login si no podemos verificar el estado
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

      const sessionJWT = await new SignJWT({
        voucher_id: String(voucherWithStudent.id),
        certification_id: voucherWithStudent.certification_id ?? null,
        code: voucherWithStudent.code,
        role: "student",
        email: voucherWithStudent.email,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);

      //TODO: pasar ip real
      const createdSession = await studentLoginTable.createSession({
        ip_address: "0.0.0.0",
        session_token: sessionJWT,
      });
      if (!createdSession) {
        throw new Error("Error creating session");
      }
      if (voucherWithStudent.students) {
        const studentWithRole = {
          ...voucherWithStudent.students,
          role: "student",
        };
        const encryptedStudent = CryptoJS.AES.encrypt(
          JSON.stringify(studentWithRole),
          process.env.JWT_SECRET!
        ).toString();
        return {
          student: encryptedStudent,
          session: sessionJWT,
          hasStudent: true,
        };
      }

      return {
        student: null,
        session: sessionJWT,
        hasStudent: false,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
