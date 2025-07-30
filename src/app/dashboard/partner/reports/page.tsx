// src/app/dashboard/partner/reports/page.tsx

"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FetchParams } from "@/lib/types";

export interface PaymentDynamicTable {
  id: string;
  voucher_quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  expiration_date: string | null;
}

export default function PartnerReportsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem("user-data");
    const parsed = session ? JSON.parse(session) : null;
    const id = parsed?.state?.decryptedUser?.id;
    if (id) setPartnerId(String(id));
  }, []);

  async function fetchPartnerPayments(
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

    if (!partnerId) return { data: [], totalCount: 0 };

    query["partner_id"] = partnerId;

    const search = new URLSearchParams(
      Object.entries(query).reduce(
        (acc, [k, v]) =>
          v !== undefined && v !== null ? { ...acc, [k]: v } : acc,
        {}
      )
    ).toString();

    const res = await fetch(`/api/payments/details-partner?${search}`);
    if (!res.ok) throw new Error("No se pudieron cargar los pagos");

    const { data, meta } = await res.json();

    return {
      data,
      totalCount: meta?.totalCount ?? 0,
    };
  }

  const columns: ColumnDef<PaymentDynamicTable>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
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
      <h2 className="text-2xl font-bold mb-1">Mis compras</h2>
      <p className="text-muted-foreground text-sm mb-4">
        Aquí puedes ver un historial de tus compras de vouchers, aplicar filtros y ordenar columnas.
      </p>
      {partnerId && (
        <DataTable
          key={refreshKey}
          columns={columns}
          fetchDataFn={fetchPartnerPayments}
        />
      )}
    </div>
  );
}
