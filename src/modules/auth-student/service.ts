import { SignJWT } from "jose";
import CryptoJS from "crypto-js";
import { StudentLoginTable, SessionsInsertType } from "./table";

const studentLoginTable = new StudentLoginTable();

export class StudentLoginService {
  async processToken(token: string) {
    try {
      const voucherWithStudent = await studentLoginTable.getVoucherWithStudent(
        token
      );

      if (
        !voucherWithStudent ||
        !voucherWithStudent.available ||
        (voucherWithStudent?.expiration_date &&
          new Date(voucherWithStudent.expiration_date) < new Date())
      ) {
        return {
          student: null,
          session: null,
          hasStudent: false,
        };
      }

      const sessionParams: SessionsInsertType = {
        voucher_id: voucherWithStudent.id,
        voucher_code: voucherWithStudent.code,
      };

      const createdSession = await studentLoginTable.createSession(
        sessionParams
      );
      if (!createdSession) {
        throw new Error("Error creating session");
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

      const sessionJWT = await new SignJWT({
        voucher_id: voucherWithStudent.id,
        certification_id: voucherWithStudent.certification_id ?? null,
        code: voucherWithStudent.code,
        role: "student",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);

      if (voucherWithStudent.student) {
        const studentWithRole = {
          ...voucherWithStudent.student,
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
