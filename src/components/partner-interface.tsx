"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import type { UserProfile } from "@/lib/types";
import { getMenuForRole } from "@/lib/navigation";

interface PartnerInterfaceProps {
  userProfile: UserProfile;
}

export function PartnerInterface({ userProfile }: PartnerInterfaceProps) {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState("Administración de Vouchers");

  // Get menu items for partner role
  const menuItems = getMenuForRole("partner");

  // Set current page based on pathname or default to Voucher Administration
  useEffect(() => {
    const currentMenuItem = menuItems.find((item) =>
      pathname === "/"
        ? item.path === "/voucher-administration"
        : pathname.includes(item.path)
    );

    if (currentMenuItem) {
      setCurrentPage(currentMenuItem.title);
    }
  }, [pathname, menuItems]);

  return (
    <DashboardLayout
      userProfile={userProfile}
      menuItems={menuItems}
      currentPage={currentPage}
      platformTitle="Plataforma T-CERT"
    >
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-bold">{currentPage}</h1>

        {currentPage === "Administración de Vouchers" && (
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-xl font-semibold mb-4">Vouchers activos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Código</th>
                    <th className="px-4 py-2 text-left">Usuario</th>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">V-{1000 + i}</td>
                      <td className="px-4 py-2">
                        TCERT-
                        {Math.random()
                          .toString(36)
                          .substring(2, 8)
                          .toUpperCase()}
                      </td>
                      <td className="px-4 py-2">Usuario {i}</td>
                      <td className="px-4 py-2">
                        {new Date().toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Activo
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button className="text-blue-600 hover:underline mr-2">
                          Ver
                        </button>
                        <button className="text-red-600 hover:underline">
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentPage === "Comprar Vouchers" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Voucher Básico",
                price: 19.99,
                features: [
                  "Acceso básico",
                  "Soporte por email",
                  "Validez: 30 días",
                ],
              },
              {
                name: "Voucher Premium",
                price: 49.99,
                features: [
                  "Acceso completo",
                  "Soporte prioritario",
                  "Validez: 90 días",
                ],
              },
              {
                name: "Voucher Empresarial",
                price: 99.99,
                features: [
                  "Acceso completo",
                  "Soporte 24/7",
                  "Validez: 1 año",
                  "Múltiples usuarios",
                ],
              },
            ].map((plan, i) => (
              <div key={i} className="rounded-lg border bg-card shadow-sm">
                <div className="p-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      /unidad
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="ml-2">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                    Comprar ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentPage === "Reportes" && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Reportes disponibles</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                <h3 className="font-medium mb-2">Reporte de ventas</h3>
                <p className="text-sm text-muted-foreground">
                  Visualiza las ventas de vouchers por período
                </p>
              </div>
              <div className="border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                <h3 className="font-medium mb-2">Reporte de uso</h3>
                <p className="text-sm text-muted-foreground">
                  Analiza el uso de vouchers por estudiantes
                </p>
              </div>
              <div className="border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                <h3 className="font-medium mb-2">Reporte de exámenes</h3>
                <p className="text-sm text-muted-foreground">
                  Estadísticas de aprobación de exámenes
                </p>
              </div>
              <div className="border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                <h3 className="font-medium mb-2">Reporte financiero</h3>
                <p className="text-sm text-muted-foreground">
                  Resumen financiero de transacciones
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
