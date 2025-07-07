import type { UserRowType } from "@/modules/auth/table";
import { Database } from "../../supabase-types";

export type UserRole = "student" | "partner" | "admin" | "unknown";
export type StudentRowType = Database["public"]["Tables"]["students"]["Row"];

export type ProfileWithRole = (UserRowType | StudentRowType) & {
  nameRol: UserRole;
};

export interface MenuItem {
  title: string;
  path: string;
  iconName: string;
  showModuleName: boolean
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

export interface FetchParams {
  [key: string]: any;
  page: number;
  limit: number;
  order_by: string;
  order_dir: "asc" | "desc";
  partner_id?: string;
}
