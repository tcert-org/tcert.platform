"use client"

import { SidebarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

interface SiteHeaderProps {
  title: string
  platformTitle: string
}

export function SiteHeader({ title, platformTitle }: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
        <Button className="h-8 w-8" variant="ghost" size="icon" onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h2 className="text-lg font-medium">{title}</h2>
        <h1 className="text-xl font-bold ml-auto">{platformTitle}</h1>
      </div>
    </header>
  )
}

