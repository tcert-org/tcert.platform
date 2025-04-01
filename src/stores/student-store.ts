import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Database } from "../../supabase-types";

export type StudentRowType = Database["public"]["Tables"]["students"]["Row"];
type StudentWithRole = StudentRowType & {
  role: string | null;
};
interface StudentState {
  student: string | null;
  decryptedStudent: StudentWithRole | null;
  updateStudent: (encryptedStudent: string) => void;
  getStudent: () => Promise<StudentWithRole | null>;
}

export const useStudentStore = create(
  persist<StudentState>(
    (set, get) => ({
      student: null,
      decryptedStudent: null,
      updateStudent: (encryptedStudent) => {
        set({ student: encryptedStudent, decryptedStudent: null });
      },
      getStudent: async () => {
        const { student, decryptedStudent } = get();
        if (!student) return null;

        if (decryptedStudent) return decryptedStudent;

        const response = await fetch("/api/decrypt-student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ encryptedStudent: student }),
        });

        if (!response.ok) {
          console.error("Failed to decrypt student");
          return null;
        }

        const data = await response.json();
        const studentData = data.student as StudentWithRole;
        set({ decryptedStudent: studentData });
        return studentData;
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
