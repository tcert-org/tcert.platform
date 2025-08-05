import { MenuItem, UserRole } from "./types";
const allMenuItems: Record<UserRole, MenuItem[]> = {
  student: [
    {
      title: "Material",
      path: "/home",
      iconName: "Home",
      showModuleName: false,
    },
    {
      title: "Simuladores",
      path: "/simulators",
      iconName: "BookOpen",
      showModuleName: false,
    },
    {
      title: "Examen",
      path: "/exam",
      iconName: "FileText",
      showModuleName: false,
    },
    {
      title: "Obtén tu Certificado",
      path: "/diploma",
      iconName: "Award",
      showModuleName: false,
    },
  ],
  partner: [
    {
      title: "Administración de Vouchers",
      path: "/voucher-administration",
      iconName: "CreditCard",
      showModuleName: false,
    },
    {
      title: "Comprar Vouchers",
      path: "/buy-vouchers",
      iconName: "ShoppingBag",
      showModuleName: false,
    },
    {
      title: "Pagos",
      path: "/reports",
      iconName: "BarChart",
      showModuleName: true,
    },
  ],
  admin: [
    {
      title: "Creacion de Partners",
      path: "/create-partners",
      iconName: "Users",
      showModuleName: false,
    },
    {
      title: "Administración de Partners",
      path: "/partners",
      iconName: "Users",
      showModuleName: false,
    },
    {
      title: "Administración de Vouchers",
      path: "/voucher-administration",
      iconName: "CreditCard",
      showModuleName: false,
    },
    {
      title: "Academica",
      path: "/exam",
      iconName: "BookOpen",
      showModuleName: false,
    },
    {
      title: "Pagos",
      path: "/reports",
      iconName: "BarChart",
      showModuleName: false,
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
