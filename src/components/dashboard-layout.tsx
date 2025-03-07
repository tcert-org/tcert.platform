"use client"

import type React from "react"

import { AppSidebar } from "./app-sidebar"
import { SiteHeader } from "./site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { UserProfile, MenuItem } from "@/lib/types"

interface DashboardLayoutProps {
  children: React.ReactNode
  userProfile: UserProfile
  menuItems: MenuItem[]
  currentPage: string
  platformTitle: string
}

export function DashboardLayout({
  children,
  userProfile,
  menuItems,
  currentPage,
  platformTitle,
}: DashboardLayoutProps) {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader title={currentPage} platformTitle={platformTitle} />
        <div className="flex flex-1">
          <AppSidebar userProfile={userProfile} menuItems={menuItems} />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

