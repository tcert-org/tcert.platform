"use client";

import React from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import type { MenuItem } from "@/lib/types";
import { UserRowType } from "@/modules/auth/table";

import {
  Home,
  BookOpen,
  FileText,
  CreditCard,
  ShoppingBag,
  BarChart,
  Users,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Home,
  BookOpen,
  FileText,
  CreditCard,
  ShoppingBag,
  BarChart,
  Users,
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProfile: (UserRowType & { roles?: { name: string } | null }) | null;
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
