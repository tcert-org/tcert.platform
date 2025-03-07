import type { LucideIcon } from "lucide-react";
import type { UserRowType } from "@/modules/auth/table";

export type UserRole = "student" | "partner" | "admin" | "unknown";

export interface UserProfile extends UserRowType {
  nameRol: UserRole;
}

export interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export type ApiResponse<T> = {
  statusCode: number;
  data?: T | null;
  error?: string;
};
