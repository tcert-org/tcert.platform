"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";
import { getDefaultPageForRole } from "@/lib/navigation";

export default function DashboardRedirect() {
  const { getUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      const user = await getUser();
      if (user) {
        const response = await fetch(`/api/roles?id=${user.role_id}`);
        if (response.ok) {
          const { data: role } = await response.json();
          router.replace(
            `/dashboard/${role.name}${getDefaultPageForRole(role.name)}`
          );
        }
      }
    }

    redirectUser();
  }, [getUser, router]);

  return null;
}
