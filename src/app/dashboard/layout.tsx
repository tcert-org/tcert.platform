"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useUserStore } from "@/stores/user-store";
import { useStudentStore } from "@/stores/student-store";
import type { ProfileWithRole, UserRole } from "@/lib/types";
import { getMenuForRole, getDefaultPageForRole } from "@/lib/navigation";
import { GeneralLoader } from "@/components/general-loader";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<ProfileWithRole | null>(null);
  const { getUser } = useUserStore();
  const { getStudent } = useStudentStore();
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = useCallback(async () => {
    const student = await getStudent();
    if (student) {
      setProfile({
        ...student,
        nameRol: student.role as UserRole,
      });

      const expectedPathPrefix = `/dashboard/${student.role}`;
      if (!pathname.startsWith(expectedPathPrefix)) {
        router.replace(
          `${expectedPathPrefix}${getDefaultPageForRole(
            student.role as UserRole
          )}`
        );
      }
      return;
    }

    // If no student profile, fallback to user profile
    const user = await getUser();
    if (user) {
      setProfile({
        ...user,
        nameRol: user.roles?.name as UserRole,
      });

      const expectedPathPrefix = `/dashboard/${user.roles?.name}`;
      if (!pathname.startsWith(expectedPathPrefix)) {
        router.replace(
          `${expectedPathPrefix}${getDefaultPageForRole(
            user.roles?.name as UserRole
          )}`
        );
      }
    }
  }, [getStudent, getUser, router, pathname]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!profile) {
    return <GeneralLoader />;
  }

  const menuItems = getMenuForRole(profile.nameRol).map((item) => ({
    ...item,
    path: `/dashboard/${profile.nameRol}${item.path}`,
  }));

  const currentMenuItem = menuItems.find((item) =>
    pathname.includes(item.path)
  );
  const currentModuleName = currentMenuItem ? currentMenuItem.title : "";

  return (
    <DashboardLayout
      userProfile={profile}
      menuItems={menuItems}
      currentModuleName={currentModuleName}
    >
      {children}
    </DashboardLayout>
  );
}
