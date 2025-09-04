"use client";

import { DataTable } from "@/components/data-table/data-table";
import {
  createActionsColumn,
  type ActionItem,
} from "@/components/data-table/action-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye } from "lucide-react";

export interface PartnerDinamicTable {
  id: string;
  company_name: string;
  email: string;
  total_vouchers: number;
  used_vouchers: number;
  unused_vouchers: number;
  expired_vouchers?: number; // Nuevo campo para vouchers expirados
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
      navigateTo: (partner) =>
        `/dashboard/admin/partners/${partner.id}?view=vouchers&partner_id=${partner.id}`,
    },
    {
      label: "Editar",
      icon: Edit,
      navigateTo: (partner) => `/dashboard/admin/partners/edit/${partner.id}`,
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-300/50">
            {row.getValue("total_vouchers")}
          </span>
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300/50">
            {row.getValue("used_vouchers")}
          </span>
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50">
            {row.getValue("unused_vouchers")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "expired_vouchers",
      header: "Vouchers Expirados",
      size: 80,
      enableSorting: true,
      meta: {
        filterType: "number",
        numberOptions: { step: 1, operators: true },
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-300/50">
            {row.getValue("expired_vouchers") || 0}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Antigüedad",
      size: 180,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        const formattedDate = date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        return (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-300/50">
              {formattedDate}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl shadow-lg shadow-purple-500/30 border border-purple-400/20">
                <Eye className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                  Gestión de Partners
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Administra y monitorea todos los partners de tu plataforma
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor de la tabla */}
        <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-lg p-6">
          <DataTable columns={columns} fetchDataFn={fetchPartners} />
        </div>
      </div>
    </div>
  );
}
