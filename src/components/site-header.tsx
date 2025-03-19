"use client";

import { SidebarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

interface SiteHeaderProps {
  currentModuleName: string;
  platformTitle: string;
}

export function SiteHeader({
  currentModuleName,
  platformTitle,
}: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        {currentModuleName && (
          <p className="text-sm text-gray-500">
            Estás en el módulo de {currentModuleName}
          </p>
        )}

        <h1 className="text-xl font-bold ml-auto">{platformTitle}</h1>
      </div>
    </header>
  );
}
