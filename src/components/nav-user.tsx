"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ProfileWithRole } from "@/lib/types";

interface NavUserProps {
  user: ProfileWithRole | null;
  className?: string;
}

export function NavUser({ user, className }: NavUserProps) {
  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleInSpanish = (role: string) => {
    switch (role) {
      case "student":
        return "Estudiante";
      case "partner":
        return "Partner";
      case "admin":
        return "Administrador";
      default:
        return role;
    }
  };

  const handleLogout = () => {
    console.log(" TODO Cerrar sesión");
  };

  return (
    <div className={className}>
      <div className="mb-1 px-2 py-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {user?.nameRol === "student"
                ? getInitials(
                    "fullname" in user ? user.fullname ?? "tcert" : "tcert"
                  )
                : getInitials(
                    user && "company_name" in user
                      ? user.company_name ?? "Ultradev"
                      : "Ultradev"
                  )}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {user && "company_name" in user
                ? user.company_name ?? "Ultradev"
                : "Ultradev"}
            </span>
            <span className="truncate text-xs">
              {getRoleInSpanish(user?.nameRol ?? "unknown")}
            </span>
          </div>
        </div>
      </div>

      <div className="ml-3 border-l border-sidebar-border pl-2 mb-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-4 w-4 stroke-[1.5px]" />
            <span>Configuración</span>
          </Link>
          <Button
            variant="ghost"
            className="flex h-auto items-center justify-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 stroke-[1.5px]" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
