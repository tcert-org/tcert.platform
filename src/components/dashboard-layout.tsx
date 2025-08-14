"use client";

import React from "react";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { MenuItem, ProfileWithRole } from "@/lib/types";

import {
  Home,
  BookOpen,
  FileText,
  CreditCard,
  ShoppingBag,
  BarChart,
  Users,
  Award,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Home,
  BookOpen,
  FileText,
  CreditCard,
  ShoppingBag,
  BarChart,
  Users,
  Award,
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  userProfile: ProfileWithRole | null; // Updated to use ProfileWithRole
  menuItems: MenuItem[];
  currentModuleName: string;
  showModuleName: boolean;
}

export function DashboardLayout({
  children,
  userProfile,
  menuItems,
  currentModuleName,
  showModuleName,
}: DashboardLayoutProps) {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader currentModuleName={currentModuleName} />
        <div className="flex flex-1">
          <AppSidebar
            userProfile={userProfile}
            menuItems={menuItems.map((item) => ({
              ...item,
              icon:
                iconMap[item.iconName] &&
                typeof iconMap[item.iconName] === "function"
                  ? React.createElement(iconMap[item.iconName])
                  : null,
            }))}
          />
          <SidebarInset>
            <div className="w-[87%] mx-auto py-10 2xl:w-[90%]">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
