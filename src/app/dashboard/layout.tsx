import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuForRole, getDefaultPageForRole } from "@/lib/navigation";
import type { UserRole } from "@/lib/types";
import { UserRowType } from "@/modules/auth/table";

export default async function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const encabezados = await headers();
  const userString = encabezados.get("x-user");

  if (!userString) {
    redirect("/sign-in");
    return null;
  }

  let user: (UserRowType & { roles?: { name: string } | null }) | null = null;
  try {
    user = JSON.parse(userString) as UserRowType & {
      roles?: { name: string };
    };
  } catch (error) {
    console.error("Error parsing user data:", error);
    redirect("/sign-in");
    return null;
  }

  const nameRol = user?.roles?.name as UserRole;
  if (!nameRol) {
    redirect("/sign-in");
    return null;
  }

  const menuItems = getMenuForRole(nameRol).map((item) => ({
    title: item.title,
    path: `/dashboard/${nameRol}${item.path}`,
    iconName: item.iconName,
  }));

  const defaultPage = getDefaultPageForRole(nameRol);
  const expectedPath = `/dashboard/${nameRol}${defaultPage}`;

  const referer = encabezados.get("referer") || "";
  const currentPath = new URL(referer, "http://localhost").pathname;

  if (currentPath !== expectedPath) {
    redirect(expectedPath);
    return null;
  }

  return (
    <DashboardLayout
      userProfile={user}
      menuItems={menuItems}
      currentModuleName="Dashboard"
    >
      {children}
    </DashboardLayout>
  );
}
