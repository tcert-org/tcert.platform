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
    },
    {
      accessorKey: "unit_price",
      header: "Precio Unitario",
      size: 140,
      meta: { filterType: "number" },
      cell: ({ row }) => {
        const val = row.getValue("unit_price");
        return val ? (
          <span className="text-gray-800">
            USD ${parseFloat(val).toFixed(2)}
          </span>
        ) : (
          "-"
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
          <span className="text-green-600 font-semibold">
            USD ${parseFloat(val).toFixed(2)}
          </span>
        ) : (
          "-"
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
        return val ? new Date(val as string).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "expiration_date",
      header: "Vencimiento",
      size: 160,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        const val = row.getValue("expiration_date");
        return val
          ? new Date(val as string).toLocaleDateString()
          : "Sin vencimiento";
      },
    },
  ];

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Módulo de Pagos</h2>
        <p className="text-muted-foreground text-sm">
          En esta sección podrás visualizar todos los pagos realizados por los partners, incluyendo información como la cantidad de vouchers adquiridos, el precio unitario, el total pagado y la fecha de compra. Puedes aplicar filtros y ordenar las columnas según lo necesites.
        </p>
      </div>
      <DataTable
        key={refreshKey}
        columns={columns}
        fetchDataFn={fetchPayments}
      />
    </div>
  );
  
}
