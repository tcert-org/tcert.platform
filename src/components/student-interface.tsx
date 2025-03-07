"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import type { UserProfile } from "@/lib/types";
import { getMenuForRole } from "@/lib/navigation";

interface StudentInterfaceProps {
  userProfile: UserProfile;
}

export function StudentInterface({ userProfile }: StudentInterfaceProps) {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState("Inicio");

  // Get menu items for student role
  const menuItems = getMenuForRole("student");

  // Set current page based on pathname or default to Home
  useEffect(() => {
    const currentMenuItem = menuItems.find((item) =>
      pathname === "/" ? item.path === "/home" : pathname.includes(item.path)
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
        <p>
          Bienvenido a la página de {currentPage.toLowerCase()} para
          estudiantes.
        </p>

        {currentPage === "Inicio" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Próximos exámenes</h2>
              <p>No tienes exámenes programados.</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">
                Progreso de estudio
              </h2>
              <p>Has completado 0% de tus simuladores.</p>
            </div>
          </div>
        )}

        {currentPage === "Simuladores" && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Simuladores disponibles
            </h2>
            <ul className="space-y-2">
              <li className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                Simulador básico
              </li>
              <li className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                Simulador avanzado
              </li>
              <li className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                Simulador de práctica
              </li>
            </ul>
          </div>
        )}

        {currentPage === "Examen" && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Exámenes disponibles</h2>
            <p className="mb-4">
              No tienes exámenes disponibles. Contacta a tu instructor para más
              información.
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Solicitar examen
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
