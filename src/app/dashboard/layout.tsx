"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useUserStore } from "@/stores/user-store";
import type { UserProfile, UserRole } from "@/lib/types";
import { getMenuForRole, getDefaultPageForRole } from "@/lib/navigation";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { getUser } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUserProfile() {
      const user = await getUser();
      if (user) {
        const response = await fetch(`/api/roles?id=${user.role_id}`);
        if (response.ok) {
          console.log("entro aqui", response);
          const { data: role } = await response.json();
          const userWithRole = { ...user, nameRol: role.name as UserRole };
          setUserProfile(userWithRole);

          const expectedPathPrefix = `/dashboard/${userWithRole.nameRol}`;
          if (!pathname.startsWith(expectedPathPrefix)) {
            router.replace(
              `${expectedPathPrefix}${getDefaultPageForRole(
                userWithRole.nameRol
              )}`
            );
          }
        }
      }
    }

    fetchUserProfile();
  }, [getUser, router, pathname]);

  if (!userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const menuItems = getMenuForRole(userProfile.nameRol).map((item) => ({
    ...item,
    path: `/dashboard/${userProfile.nameRol}${item.path}`,
  }));

  const currentMenuItem = menuItems.find((item) =>
    pathname.includes(item.path)
  );
  const currentModuleName = currentMenuItem
    ? currentMenuItem.title
    : "Módulo Desconocido";

  return (
    <DashboardLayout
      userProfile={userProfile}
      menuItems={menuItems}
      currentModuleName={currentModuleName}
    >
      {children}
    </DashboardLayout>
  );
}
