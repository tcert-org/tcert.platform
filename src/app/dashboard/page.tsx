"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";
import { useStudentStore } from "@/stores/student-store";
import { useRouter } from "next/navigation";
import { getDefaultPageForRole } from "@/lib/navigation";
import { UserRole } from "@/lib/types";

export default function DashboardRedirect() {
  const { getUser } = useUserStore();
  const { getStudent } = useStudentStore();
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      const user = await getUser();

      if (user) {
        const roleName = user.roles?.name ?? "unknown";
        router.replace(
          `/dashboard/${roleName}${getDefaultPageForRole(roleName as UserRole)}`
        );
        return;
      }

      const studentResult = await getStudent();

      if (studentResult.statusCode === "active" && studentResult.data) {
        const roleName = studentResult.data.role as UserRole;
        router.replace(
          `/dashboard/${roleName}${getDefaultPageForRole(roleName)}`
        );
      }
    }

    redirectUser();
  }, [getStudent, getUser, router]);

  return null;
}
