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

// Define all menu items
const allMenuItems: Record<UserRole, MenuItem[]> = {
  student: [
    {
      title: "Inicio",
      path: "/home",
      icon: Home,
    },
    {
      title: "Simuladores",
      path: "/simulators",
      icon: BookOpen,
    },
    {
      title: "Examen",
      path: "/exam",
      icon: FileText,
    },
  ],
  partner: [
    {
      title: "Administración de Vouchers",
      path: "/voucher-administration",
      icon: CreditCard,
    },
    {
      title: "Comprar Vouchers",
      path: "/buy-vouchers",
      icon: ShoppingBag,
    },
    {
      title: "Reportes",
      path: "/reports",
      icon: BarChart,
    },
  ],
  admin: [
    {
      title: "Administración de Vouchers",
      path: "/voucher-administration",
      icon: CreditCard,
    },
    {
      title: "Comprar Vouchers",
      path: "/buy-vouchers",
      icon: ShoppingBag,
    },
    {
      title: "Reportes",
      path: "/reports",
      icon: BarChart,
    },
    {
      title: "Socios",
      path: "/partners",
      icon: Users,
    },
  ],
  unknown: [],
};

// Get menu items for a specific role
export function getMenuForRole(role: UserRole): MenuItem[] {
  return allMenuItems[role] || [];
}

// Get default page for a role
export function getDefaultPageForRole(role: UserRole): string {
  if (role === "student") {
    return "/home";
  }
  return "/voucher-administration";
}
