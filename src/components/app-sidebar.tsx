"use client"

import type React from "react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar"
import type { UserProfile, MenuItem } from "@/lib/types"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProfile: UserProfile
  menuItems: MenuItem[]
}

export function AppSidebar({ userProfile, menuItems, ...props }: AppSidebarProps) {
  return (
    <Sidebar className="top-[--header-height] !h-[calc(100svh-var(--header-height))]" {...props}>
      <SidebarHeader className="pb-0">
        <NavUser user={userProfile} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain menuItems={menuItems} />
      </SidebarContent>
    </Sidebar>
  )
}

