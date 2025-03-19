import { MenuItem, UserRole } from "./types";

const allMenuItems: Record<UserRole, MenuItem[]> = {
  student: [
    { title: "Inicio", path: "/home", iconName: "Home" },
    { title: "Simuladores", path: "/simulators", iconName: "BookOpen" },
    { title: "Examen", path: "/exam", iconName: "FileText" },
  ],
  partner: [
    {
      title: "Administración de Vouchers",
      path: "/voucher-administration",
      iconName: "CreditCard",
    },
    {
      title: "Comprar Vouchers",
      path: "/buy-vouchers",
      iconName: "ShoppingBag",
    },
    // { title: "Reportes", path: "/reports", iconName: "BarChart" },
  ],
  admin: [
    {
      title: "Administración de Partners",
      path: "/partners",
      iconName: "Users",
    },
    {
      title: "Administración de Vouchers",
      path: "/voucher-administration",
      iconName: "CreditCard",
    },
  ],
  unknown: [],
};

export function getMenuForRole(role: UserRole): MenuItem[] {
  return allMenuItems[role] || [];
}

export function getDefaultPageForRole(role: UserRole): string {
  const defaultPages: Record<UserRole, string> = {
    student: "/home",
    partner: "/voucher-administration",
    admin: "/partners",
    unknown: "/",
  };

  return defaultPages[role] || "/voucher-administration";
}
