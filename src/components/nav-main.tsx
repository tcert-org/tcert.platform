"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavMainProps {
  menuItems: any[];
}

export function NavMain({ menuItems }: NavMainProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menú</SidebarGroupLabel>
      <SidebarMenu>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
              >
                <Link href={item.path} className="flex items-center gap-2">
                  {item.icon} <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
