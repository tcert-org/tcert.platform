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
  extension_date: string | null;
}

function formatUSD(value: number): string {
  const isInteger = Number.isInteger(value);
  return `USD ${isInteger ? value : value.toFixed(2)}`;
}

function addMonthsToDate(date: Date, months: number): Date {
  const result = new Date(date);
  const currentMonth = result.getMonth();
  result.setMonth(currentMonth + months);
  if (result.getMonth() !== (currentMonth + months) % 12) {
    result.setDate(0);
  }
  return result;
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

    const [resPayments, resParams] = await Promise.all([
      fetch(`/api/payments/details-partner?${search}`),
      fetch("/api/params"),
    ]);

    if (!resPayments.ok || !resParams.ok) {
      throw new Error("Error al cargar los pagos o parámetros");
    }

    const { data, meta } = await resPayments.json();
    const { data: paramsData } = await resParams.json();

    const expirationMonths = parseInt(
      paramsData.find((p: any) => p.id === 1)?.value ?? "0",
      10
    );

    const processedData = data.map((item: any) => {
      if (!item.expiration_date && expirationMonths > 0) {
        const createdDate = new Date(item.created_at);
        const expiration = addMonthsToDate(createdDate, expirationMonths);
        return {
          ...item,
          expiration_date: expiration.toISOString(),
        };
      }
      return item;
    });

    return {
      data: processedData,
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
          <span className="text-gray-800">{formatUSD(parseFloat(val))}</span>
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
            {formatUSD(parseFloat(val))}
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
    {
      accessorKey: "extension_date",
      header: "Fecha Extensión",
      size: 160,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        const val = row.getValue("extension_date");
        return val
          ? new Date(val as string).toLocaleDateString()
          : "No programada";
      },
    },
    {
      id: "extension",
      header: "Extensión",
      size: 120,
      cell: ({ row }) => {
        const paymentId = row.original.id;
        const extensionRaw = row.original.extension_date;
        const expirationRaw = row.original.expiration_date;

        const extensionDate = extensionRaw ? new Date(extensionRaw) : null;
        const expirationDate = expirationRaw ? new Date(expirationRaw) : null;
        const today = new Date();

        const canExtend =
          extensionDate &&
          expirationDate &&
          today >= new Date(extensionDate.toDateString()) &&
          today <= new Date(expirationDate.toDateString());

        return (
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/payments/", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ payment_id: paymentId }),
                });

                if (!res.ok) throw new Error("Error al extender");

                setRefreshKey((prev) => prev + 1);
              } catch (err) {
                console.error("Extensión fallida:", err);
              }
            }}
            disabled={!canExtend}
            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              canExtend
                ? "text-blue-600 border border-blue-600 hover:bg-blue-50"
                : "text-gray-400 border border-gray-300 cursor-not-allowed"
            }`}
          >
            Extender
          </button>
        );
      },
    },
  ];

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-1">Mis compras</h2>
      <p className="text-muted-foreground text-sm mb-4">
        Aquí puedes ver un historial de tus compras de vouchers, aplicar filtros
        y ordenar columnas.
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
