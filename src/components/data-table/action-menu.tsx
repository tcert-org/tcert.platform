"use client";

import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export interface ActionItem<TData> {
  label: string | ((record: TData) => string);
  icon?: LucideIcon | ((record: TData) => LucideIcon);
  action?: (record: TData) => void;
  navigateTo?: (record: TData) => string; // Ruta de navegación
  variant?: "default" | "destructive";
  showCondition?: (record: TData) => boolean;
}

interface ActionMenuProps<TData> {
  record: TData;
  actions: ActionItem<TData>[];
}

export function ActionMenu<TData>({ record, actions }: ActionMenuProps<TData>) {
  const router = useRouter();

  // Filter actions based on showCondition
  const visibleActions = actions.filter(
    (action) => !action.showCondition || action.showCondition(record)
  );

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {visibleActions.map((action, index) => {
          const label =
            typeof action.label === "function"
              ? action.label(record as any)
              : action.label;

          const Icon =
            typeof action.icon === "function"
              ? action.icon(record as any)
              : action.icon;
// TODO Icon
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => {
                if (action.action) {
                  action.action(record);
                }
                if (action.navigateTo) {
                  router.push(action.navigateTo(record));
                }
              }}
              className={
                action.variant === "destructive" ? "text-destructive" : ""
              }
            >
              {Icon && <span className="mr-2 h-4 w-4" />} 
              {label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function createActionsColumn<TData>(actions: ActionItem<TData>[]) {
  return {
    id: "actions",
    header: "",
    cell: ({ row }: { row: { original: TData } }) => (
      <ActionMenu record={row.original} actions={actions} />
    ),
    enableSorting: false,
    enableFiltering: false,
    size: 50,
  };
}
