"use client";

import { DataTable } from "@/components/data-table/data-table";
import {
  createActionsColumn,
  type ActionItem,
} from "@/components/data-table/action-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { CloudCog, Edit, Eye } from "lucide-react";
import { FetchParams } from "@/lib/types";

export interface PartnerDinamicTable {
  id: string;
  company_name: string;
  email: string;
  total_vouchers: number;
  used_vouchers: number;
  unused_vouchers: number;
  created_at: string;
}

async function fetchPartners(
  params: Record<string, any>
): Promise<{ data: PartnerDinamicTable[]; totalCount: number }> {
  try {
    const query: Record<string, any> = {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      order_by: params.order_by ?? "created_at",
      order_dir: params.order_dir ?? "desc",
    };

    // Agrega dinámicamente los filtros planos: filter_company_name, etc.
    for (const key in params) {
      if (key.startsWith("filter_")) {
        query[key] = params[key];
      }
    }

    const queryParams = new URLSearchParams(query).toString();
    console.log("🔍 queryParams:", queryParams);

    const response = await fetch(
      `/api/request-table/partners/?${queryParams}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(
        `"request /api/request-table/partners/?${queryParams}" failed: ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("Partners recibidos:", result);
    return {
      data: result.data,
      totalCount: result.totalCount,
    };
  } catch (error) {
    console.error("Error fetching partners:", error);
    return { data: [], totalCount: 0 };
  }
}

export default function PartnersPage() {
  const partnerActions: ActionItem<PartnerDinamicTable>[] = [
    {
      label: "Ver detalles",
      icon: Eye,
      navigateTo: (partner) => `/dashboard/admin/partners/${partner.id}`,
    },
    {
      label: "Editar",
      icon: Edit,
      navigateTo: (partner) => `/partners/edit/${partner.id}`,
    },
  ];

  const columns: ColumnDef<PartnerDinamicTable>[] = [
    createActionsColumn(partnerActions),
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
      enableSorting: false,
    },
    {
      accessorKey: "company_name",
      header: "Nombre de empresa",
      size: 200,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "email",
      header: "Correo",
      size: 250,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "total_vouchers",
      header: "Vouchers Comprados",
      size: 80,
      enableSorting: true,
      meta: {
        filterType: "number",
        numberOptions: { step: 1, operators: true },
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue("total_vouchers")}
        </div>
      ),
    },
    {
      accessorKey: "used_vouchers",
      header: "Vouchers Usados",
      size: 80,
      enableSorting: true,
      meta: {
        filterType: "number",
        numberOptions: { step: 1, operators: true },
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue("used_vouchers")}
        </div>
      ),
    },
    {
      accessorKey: "unused_vouchers",
      header: "Vouchers Disponibles",
      size: 80,
      enableSorting: true,
      meta: {
        filterType: "number",
        numberOptions: { step: 1, operators: true },
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue("unused_vouchers")}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Antigüedad",
      size: 180,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        return new Date(row.getValue("created_at")).toLocaleDateString(
          "es-ES",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );
      },
    },
  ];

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <DataTable columns={columns} fetchDataFn={fetchPartners} />
    </div>
  );
}
