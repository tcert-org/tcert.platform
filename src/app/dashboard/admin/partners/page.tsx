"use client";

import { DataTable } from "@/components/data-table/data-table";
import {
  createActionsColumn,
  type ActionItem,
} from "@/components/data-table/action-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Eye, Copy } from "lucide-react";
import { FetchParams } from "@/lib/types";

export interface PartnerDinamicTable {
  id: string;
  company_name: string;
  email: string;
  total_vouchers: number;
  used_vouchers: number;
  created_at: string;
}

async function fetchPartners(
  params: FetchParams
): Promise<{ data: PartnerDinamicTable[]; totalCount: number }> {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(
      `/api/request-table/partners/?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `"request /api/request-table/partners/?${queryParams}" was not successfull: ${response.statusText}`
      );
    }

    const result = await response.json();

    const formattedData = result.data as PartnerDinamicTable[];

    return {
      data: formattedData,
      totalCount: result.totalCount,
    };
  } catch (error) {
    throw error;
  }
}

export default function PartnersPage() {
  const partnerActions: ActionItem<PartnerDinamicTable>[] = [
    {
      label: "Ver detalles",
      icon: Eye,
      navigateTo: (partner) => `/dashboard/admin/partners/${partner.id}`, // Redirigir a detalles
    },
    {
      label: "Editar",
      icon: Edit,
      navigateTo: (partner) => `/partners/edit/${partner.id}`, // Redirigir a edición
    },
    {
      label: "Duplicar",
      icon: Copy,
      action: (partner) => {
        console.log(`Duplicando a ${partner.company_name}`);
      },
    },
    {
      label: "Eliminar",
      icon: Trash2,
      action: (partner) => {
        console.log(`Eliminando a ${partner.company_name}`);
      },
      variant: "destructive",
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
        numberOptions: {
          step: 1,
          operators: true,
        },
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
        numberOptions: {
          step: 1,
          operators: true,
        },
      },
      cell: ({ row }) => (
        <div className="!text-center font-medium">
          {row.getValue("used_vouchers")}
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
