import { Database } from "@/lib/database/database.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Tipos desde Supabase
export type StudentRowType = Database["public"]["Tables"]["students"]["Row"];

type StudentWithRole = StudentRowType & {
  role: string | null;
};

export enum StudentStatusLogin {
  ACTIVE = "active",
  FIRST_TIME = "first_time",
  INACTIVE = "inactive",
}

interface StudentState {
  student: string | null;
  decryptedStudent: StudentWithRole | null;
  access_token: string | null; 
  isStudent: boolean;
  updateStudent: (encryptedStudent: string, token: string) => void;
  getStudent: () => Promise<{
    statusCode: StudentStatusLogin;
    data: StudentWithRole | null;
  }>;
}

export const useStudentStore = create(
  persist<StudentState>(
    (set, get) => ({
      student: null,
      decryptedStudent: null,
      access_token: null, 
      isStudent: false,
      updateStudent: (encryptedStudent, token) => {
        set({
          student: encryptedStudent,
          decryptedStudent: null,
          access_token: token, 
          isStudent: true,
        });
      },
      getStudent: async () => {
        const { student, decryptedStudent, isStudent } = get();
    
        if (!student) {
          if (isStudent)
            return { statusCode: StudentStatusLogin.FIRST_TIME, data: null };
          return { statusCode: StudentStatusLogin.INACTIVE, data: null };
        }

        if (decryptedStudent)
          return {
            statusCode: StudentStatusLogin.ACTIVE,
            data: decryptedStudent,
          };

        const response = await fetch("/api/decrypt-student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ encryptedStudent: student }),
        });

        if (!response.ok) {
          console.error("Failed to decrypt student");
          return { statusCode: StudentStatusLogin.INACTIVE, data: null };
        }

        const data = await response.json();
        const studentData = data.student as StudentWithRole;
        set({ decryptedStudent: studentData });

        return {
          statusCode: StudentStatusLogin.ACTIVE,
          data: studentData,
        };
      },
    }),
    {
      name: "student-data",
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
