"use client";

import React from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProfile: ProfileWithRole | null; // Updated to use ProfileWithRole
  menuItems: MenuItem[];
}

export function AppSidebar({
  userProfile,
  menuItems,
  ...props
}: AppSidebarProps) {
  const menuItemsWithIcons = menuItems.map((item) => ({
    ...item,
    icon: iconMap[item.iconName]
      ? React.createElement(iconMap[item.iconName])
      : null,
  }));

  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader className="pb-0">
        <NavUser user={userProfile} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain menuItems={menuItemsWithIcons} />
      </SidebarContent>
    </Sidebar>
  );
}
