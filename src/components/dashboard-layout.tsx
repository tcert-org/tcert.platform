"use client";

import type React from "react";

import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserProfile, MenuItem } from "@/lib/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userProfile: UserProfile;
  menuItems: MenuItem[];
  currentModuleName: string; // Nombre del módulo actual
}

export function DashboardLayout({
  children,
  userProfile,
  menuItems,
  currentModuleName,
}: DashboardLayoutProps) {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader
          currentModuleName={currentModuleName}
          platformTitle="Plataforma T-Cert"
        />
        <div className="flex flex-1">
          <AppSidebar userProfile={userProfile} menuItems={menuItems} />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <h1 className="text-2xl font-bold">{currentModuleName}</h1>
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
