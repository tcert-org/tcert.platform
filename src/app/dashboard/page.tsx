"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";
import { getDefaultPageForRole } from "@/lib/navigation";
import { UserRole } from "@/lib/types";

export default function DashboardRedirect() {
  const { getUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      const user = await getUser();
      if (user) {
        const roleName = user.roles?.name ?? "unknown";
        if (roleName) {
          router.replace(
            `/dashboard/${roleName}${getDefaultPageForRole(
              roleName as UserRole
            )}`
          );
        }
      }
    }

    redirectUser();
  }, [getUser, router]);

  return null;
}
