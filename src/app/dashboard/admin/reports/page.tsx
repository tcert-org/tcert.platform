// src/app/dashboard/admin/payments/page.tsx

"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FetchParams } from "@/lib/types";

export interface PaymentDynamicTable {
  id: string;
  partner_name: string;
  voucher_quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  expiration_date: string | null;
}

async function fetchPayments(
  params: FetchParams
): Promise<{ data: PaymentDynamicTable[]; totalCount: number }> {
  const query: Record<string, any> = {
    page: params.page ?? 1,
    limit_value: params.limit ?? 10,
    order_by: params.order_by ?? "created_at",
    order_dir: params.order_dir ?? "desc",
  };

  if (params.filters) {
    for (const filter of params.filters) {
      const val = filter.value;

      if (typeof val === "string" && val.includes(":")) {
        const [op, rawValue] = val.split(":");
        query[`filter_${filter.id}_op`] = op;
        query[`filter_${filter.id}`] = rawValue;
      } else {
        query[`filter_${filter.id}`] = val;
      }
    }
  }

  const search = new URLSearchParams(
    Object.entries(query).reduce(
      (acc, [k, v]) =>
        v !== undefined && v !== null ? { ...acc, [k]: v } : acc,
      {}
    )
  ).toString();

  const res = await fetch(`/api/payments?${search}`);
  if (!res.ok) throw new Error("No se pudieron cargar los pagos");

  const { data, meta } = await res.json();

  return {
    data,
    totalCount: meta?.totalCount ?? 0,
  };
}

export default function PaymentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const columns: ColumnDef<PaymentDynamicTable>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
    },
    {
      accessorKey: "partner_name",
      header: "Partner",
      size: 220,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "voucher_quantity",
      header: "Cantidad de Vouchers",
      size: 160,
      meta: { filterType: "number" },
      cell: ({ row }) => {
        const quantity = row.getValue("voucher_quantity") as number;
        return (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-300/50">
              {quantity} vouchers
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "unit_price",
      header: "Precio Unitario",
      size: 140,
      meta: { filterType: "number" },
      cell: ({ row }) => {
        const val = row.getValue("unit_price");
        return val ? (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300/50">
              ${Math.round(parseFloat(val as string))} USD
            </span>
          </div>
        ) : (
          <div className="text-center text-gray-400">-</div>
        );
      },
    },
    {
      accessorKey: "total_price",
      header: "Precio Total",
      size: 140,
      meta: { filterType: "number" },
      cell: ({ row }) => {
        const val = row.getValue("total_price");
        return val ? (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50">
              ${Math.round(parseFloat(val as string))} USD
            </span>
          </div>
        ) : (
          <div className="text-center text-gray-400">-</div>
        );
      },
    },

    {
      accessorKey: "created_at",
      header: "Fecha de Compra",
      size: 160,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        const val = row.getValue("created_at");
        const formattedDate = val
          ? new Date(val as string).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";

        return val ? (
          <div className="text-center">
            <span>{formattedDate}</span>
          </div>
        ) : (
          <div className="text-center text-gray-400">-</div>
        );
      },
    },
    {
      accessorKey: "expiration_date",
      header: "Vencimiento",
      size: 160,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        const val = row.getValue("expiration_date");
        const formattedDate = val
          ? new Date(val as string).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : null;

        if (!val) {
          return (
            <div className="text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-300/50">
                Sin vencimiento
              </span>
            </div>
          );
        }

        return (
          <div className="text-center">
            <span>{formattedDate}</span>
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
                <svg
                  className="h-6 w-6 text-white drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                  Módulo de Pagos
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Visualiza y gestiona todos los pagos realizados por los
                  partners
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor de la tabla */}
        <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-lg p-6">
          <DataTable
            key={refreshKey}
            columns={columns}
            fetchDataFn={fetchPayments}
          />
        </div>
      </div>
    </div>
  );
}
