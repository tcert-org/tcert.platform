"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useUserStore } from "@/stores/user-store";
import { StudentStatusLogin, useStudentStore } from "@/stores/student-store";
import type { ProfileWithRole, UserRole } from "@/lib/types";
import { getMenuForRole, getDefaultPageForRole } from "@/lib/navigation";
import { GeneralLoader } from "@/components/general-loader";
import StudentForm from "@/components/form-first-time-student";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<ProfileWithRole | null>(null);
  const [studentFirstTime, setStudentFirstTime] = useState<boolean>(false);
  const { getUser } = useUserStore();
  const { getStudent } = useStudentStore();
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = useCallback(async () => {
    console.log("[DEBUG] Iniciando fetch paralelo de perfil...");

    const [studentResult, userResult] = await Promise.all([
      getStudent(),
      getUser(),
    ]);

    console.log("[DEBUG] Resultado getStudent:", studentResult);
    console.log("[DEBUG] Resultado getUser:", userResult);

    if (studentResult?.statusCode === StudentStatusLogin.FIRST_TIME) {
      console.log("[DEBUG] Estudiante primera vez detectado.");
      setStudentFirstTime(true);
      return;
    }

    if (
      studentResult?.statusCode === StudentStatusLogin.ACTIVE &&
      studentResult?.data
    ) {
      const role = studentResult.data.role as UserRole;
      setProfile({ ...studentResult.data, nameRol: role });

      const expectedPathPrefix = `/dashboard/${role}`;
      if (!pathname.startsWith(expectedPathPrefix)) {
        router.replace(`${expectedPathPrefix}${getDefaultPageForRole(role)}`);
      }
      return;
    }

    if (userResult) {
      const role = userResult.roles?.name as UserRole;
      setProfile({ ...userResult, nameRol: role });

      const expectedPathPrefix = `/dashboard/${role}`;
      if (!pathname.startsWith(expectedPathPrefix)) {
        router.replace(`${expectedPathPrefix}${getDefaultPageForRole(role)}`);
      }
      return;
    }

    console.warn("[DEBUG] Ni estudiante ni usuario están autenticados");
    setProfile(null);
    setStudentFirstTime(false);
  }, [getStudent, getUser, pathname, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!profile) {
    if (studentFirstTime) {
      return <StudentForm />;
    }
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
