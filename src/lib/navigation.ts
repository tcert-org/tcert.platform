import {
  Home,
  BookOpen,
  FileText,
  CreditCard,
  ShoppingBag,
  BarChart,
  Users,
} from "lucide-react";
import type { UserRole, MenuItem } from "./types";

const allMenuItems: Record<UserRole, MenuItem[]> = {
  student: [
    { title: "Inicio", path: "/home", icon: Home },
    { title: "Simuladores", path: "/simulators", icon: BookOpen },
    { title: "Examen", path: "/exam", icon: FileText },
  ],
  partner: [
    {
      title: "Administración de Vouchers",
      path: "/voucher-administration",
      icon: CreditCard,
    },
    { title: "Comprar Vouchers", path: "/buy-vouchers", icon: ShoppingBag },
    { title: "Reportes", path: "/reports", icon: BarChart },
  ],
  admin: [
    {
      title: "Administración de Vouchers",
      path: "/voucher-administration",
      icon: CreditCard,
    },
    { title: "Reportes", path: "/reports", icon: BarChart },
    { title: "Partners", path: "/partners", icon: Users },
  ],
  unknown: [],
};

export function getMenuForRole(role: UserRole): MenuItem[] {
  return allMenuItems[role] || [];
}

export function getDefaultPageForRole(role: UserRole): string {
  return role === "student" ? "/home" : "/voucher-administration";
}
