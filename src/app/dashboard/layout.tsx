"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useUserStore } from "@/stores/user-store";
import type { UserProfile, UserRole } from "@/lib/types";
import { getMenuForRole, getDefaultPageForRole } from "@/lib/navigation";
import { GeneralLoader } from "@/components/general-loader";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { getUser } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserProfile = useCallback(async () => {
    const user = await getUser();
    if (user) {
      const userWithRole = { ...user, nameRol: user.roles?.name as UserRole };
      setUserProfile(userWithRole);

      const expectedPathPrefix = `/dashboard/${userWithRole.nameRol}`;
      if (!pathname.startsWith(expectedPathPrefix)) {
        router.replace(
          `${expectedPathPrefix}${getDefaultPageForRole(userWithRole.nameRol)}`
        );
      }
    }
  }, [getUser, router, pathname]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (!userProfile) {
    return <GeneralLoader />;
  }

  const menuItems = getMenuForRole(userProfile.nameRol).map((item) => ({
    ...item,
    path: `/dashboard/${userProfile.nameRol}${item.path}`,
  }));

  const currentMenuItem = menuItems.find((item) =>
    pathname.includes(item.path)
  );
  const currentModuleName = currentMenuItem ? currentMenuItem.title : "";

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
