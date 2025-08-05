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
        const val = row.getValue("unit_price") as number;
        return val ? (
          <div className="text-center">
            <span className="text-gray-800">{formatUSD(val)}</span>
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
        const val = row.getValue("total_price") as number;
        return val ? (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50">
              {formatUSD(val)}
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
            <span className="text-gray-700">{formattedDate}</span>
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

        // Verificar si está vencido o próximo a vencer
        const today = new Date();
        const expirationDate = new Date(val as string);
        const isExpired = expirationDate < today;
        const isExpiringSoon =
          (expirationDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24) <=
          30;

        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isExpired
                  ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300/50"
                  : isExpiringSoon
                  ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300/50"
                  : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300/50"
              }`}
            >
              {formattedDate}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "extension_date",
      header: "Fecha Extensión",
      size: 160,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        const val = row.getValue("extension_date");
        const formattedDate = val
          ? new Date(val as string).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : null;

        return val ? (
          <div className="text-center">
            <span className="text-gray-700">{formattedDate}</span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-gray-500">No programada</span>
          </div>
        );
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
          <div className="text-center">
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
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                canExtend
                  ? "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-300/50 hover:from-purple-200 hover:to-violet-200"
                  : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-400 border border-gray-300/50 cursor-not-allowed"
              }`}
            >
              Extender
            </button>
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
                    d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                  Mis Compras
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Historial completo de tus adquisiciones de vouchers
                </p>
              </div>
            </div>
          </div>

          {/* Descripción detallada */}
          <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-200/80 rounded-lg p-4 border border-orange-300/60 shadow-lg shadow-orange-200/40">
            <p className="text-sm text-gray-700 leading-relaxed">
              Aquí puedes ver un historial detallado de todas tus compras de
              vouchers, incluyendo cantidad adquirida, precios, fechas de compra
              y vencimiento. Puedes aplicar filtros y ordenar las columnas según
              tus necesidades.
            </p>
          </div>
        </div>

        {/* Contenedor de la tabla */}
        <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-lg p-6">
          {partnerId && (
            <DataTable
              key={refreshKey}
              columns={columns}
              fetchDataFn={fetchPartnerPayments}
            />
          )}
        </div>
      </div>
    </div>
  );
}
