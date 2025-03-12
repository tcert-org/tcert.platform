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
    { title: "Reportes", path: "/reports", iconName: "BarChart" },
  ],
  admin: [
    {
      title: "Administración de Vouchers",
      path: "/voucher-administration",
      iconName: "CreditCard",
    },
    { title: "Reportes", path: "/reports", iconName: "BarChart" },
    { title: "Partners", path: "/partners", iconName: "Users" },
  ],
  unknown: [],
};

export function getMenuForRole(role: UserRole): MenuItem[] {
  return allMenuItems[role] || [];
}

export function getDefaultPageForRole(role: UserRole): string {
  return role === "student" ? "/home" : "/voucher-administration";
}
