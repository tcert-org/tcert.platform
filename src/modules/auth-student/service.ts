import { SignJWT } from "jose";
import CryptoJS from "crypto-js";
import { StudentLoginTable, SessionsInsertType } from "./table";

const studentLoginTable = new StudentLoginTable();

export class StudentLoginService {
  async processToken(token: string) {
    try {
      console.log("Processing student token:", token);
      const voucherWithStudent = await studentLoginTable.getVoucherWithStudent(
        token
      );
      console.log("Voucher with student:", voucherWithStudent);

      if (
        !voucherWithStudent ||
        !voucherWithStudent.used ||
        (voucherWithStudent?.expiration_date &&
          new Date(voucherWithStudent.expiration_date) < new Date())
      ) {
        return {
          student: null,
          session: null,
          hasStudent: false,
        };
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
      const createdSession = await studentLoginTable.createSession(
        {
          ip_address: "0.0.0.0", 
          session_token: sessionJWT,
        }
      );
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
console.log("Encrypted student data:", studentWithRole);
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
