"use client";

import { SidebarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";

interface SiteHeaderProps {
  currentModuleName: string;
}

export function SiteHeader({
  currentModuleName,
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

        <div className="ml-auto">
          <Image
            src="/sm-full-color.png"
            alt="Plataforma T-Cert Logo"
            height={20}
            width={80}
            priority
          />
        </div>
      </div>
    </header>
  );
}
