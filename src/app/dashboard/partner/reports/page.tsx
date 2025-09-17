"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createActionsColumn } from "@/components/data-table/action-menu";

// Acción reutilizable al estilo Admin
type ActionItem<T> = {
  label: string;
  action?: (row: T) => void;
  hidden?: (row: T) => boolean;
};

export interface PaymentDynamicTable {
  id: string;
  voucher_quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  expiration_date: string | null;
  extension_date: string | null;
  extension_used?: boolean;
  file_url?: string | null; // <- NUEVO: URL del comprobante
}

function formatUSD(value: number): string {
  const isInteger = Number.isInteger(value);
  return `$${isInteger ? value : value.toFixed(2)} USD`;
}

// Helper function para formatear fechas sin problemas de timezone
function formatDateSafe(dateString: string): string {
  // Extraer solo la parte de fecha (YYYY-MM-DD) de un ISO string
  const dateOnly = dateString.split("T")[0];
  const [year, month, day] = dateOnly.split("-");

  // Crear fecha usando los componentes individuales para evitar timezone issues
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  const [extensionPriceInfo, setExtensionPriceInfo] = useState<{
    exists: boolean;
    price?: number;
    isValid?: boolean;
  }>({ exists: false });
  const [processedPayments, setProcessedPayments] = useState<Set<string>>(
    new Set()
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    const session = sessionStorage.getItem("user-data");
    const parsed = session ? JSON.parse(session) : null;
    const id = parsed?.state?.decryptedUser?.id;
    if (id) setPartnerId(String(id));
  }, []);

  // Verificar configuración de precio de extensión
  useEffect(() => {
    const checkExtensionPrice = async () => {
      try {
        const res = await fetch("/api/params/extension-price");
        const data = await res.json();
        setExtensionPriceInfo(data);
      } catch (error) {
        console.error("Error al verificar precio de extensión:", error);
        setExtensionPriceInfo({ exists: false });
      }
    };
    checkExtensionPrice();
  }, []);

  // Manejar éxito de extensión
  useEffect(() => {
    const extensionSuccess = searchParams.get("extension_success");
    const paymentId = searchParams.get("payment_id");

    if (
      extensionSuccess === "true" &&
      paymentId &&
      !processedPayments.has(paymentId)
    ) {
      setProcessedPayments((prev) => new Set([...prev, paymentId]));

      const processExtension = async () => {
        try {
          const res = await fetch("/api/payments/extension/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payment_id: paymentId }),
          });

          const data = await res.json();

          if (res.ok) {
            if (data.already_processed) {
              toast.info("Esta extensión ya fue procesada anteriormente", {
                duration: 3000,
                description: "No se realizaron cambios adicionales.",
              });
            } else {
              toast.success(
                "¡Extensión de 1 año procesada exitosamente! Las fechas de vencimiento han sido extendidas por 12 meses.",
                {
                  duration: 5000,
                  description:
                    "Todas las fechas han sido actualizadas correctamente.",
                }
              );
            }
          } else {
            console.error("Error al procesar extensión:", data.error);
            toast.error(`Error al procesar la extensión: ${data.error}`);
            setProcessedPayments((prev) => {
              const newSet = new Set(prev);
              newSet.delete(paymentId);
              return newSet;
            });
          }
        } catch (error) {
          console.error("Error al procesar extensión:", error);
          toast.error("Error inesperado al procesar la extensión");
          setProcessedPayments((prev) => {
            const newSet = new Set(prev);
            newSet.delete(paymentId);
            return newSet;
          });
        } finally {
          setRefreshKey((prev) => prev + 1);
          const url = new URL(window.location.href);
          url.searchParams.delete("extension_success");
          url.searchParams.delete("payment_id");
          window.history.replaceState({}, "", url.toString());
        }
      };

      processExtension();
    }
  }, [searchParams, processedPayments]);

  async function fetchPartnerPayments(
    params: Record<string, any>
  ): Promise<{ data: PaymentDynamicTable[]; totalCount: number }> {
    try {
      const query: Record<string, any> = {
        page: params.page ?? 1,
        limit_value: params.limit ?? 10,
        order_by: params.order_by ?? "created_at",
        order_dir: params.order_dir ?? "desc",
      };

      // Agregar todos los filtros que empiecen con 'filter_'
      for (const key in params) {
        if (key.startsWith("filter_")) {
          const value = params[key];
          if (key.endsWith("_op")) {
            query[key] = value;
          } else if (value !== undefined && value !== null && value !== "") {
            query[key] = value;
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

      const resPayments = await fetch(
        `/api/payments/details-partner?${search}`
      );
      if (!resPayments.ok) throw new Error("Error al cargar los pagos");

      const { data, meta } = await resPayments.json();

      // Obtener params para calcular expiración faltante
      const paramsRes = await fetch("/api/params");
      const { data: paramsData } = await paramsRes.json();
      const expirationMonths = parseInt(
        paramsData.find((p: any) => p.id === 1)?.value ?? "0",
        10
      );

      // Mapear files -> file_url y completar expiración
      const processedData: PaymentDynamicTable[] = data.map((item: any) => {
        let expiration_date = item.expiration_date;
        if (!expiration_date && expirationMonths > 0) {
          const createdDate = new Date(item.created_at);
          expiration_date = addMonthsToDate(
            createdDate,
            expirationMonths
          ).toISOString();
        }
        return {
          ...item,
          expiration_date,
          file_url: item.files ?? null, // <- aquí queda disponible para la acción
        };
      });

      return {
        data: processedData,
        totalCount: meta?.totalCount ?? 0,
      };
    } catch (error) {
      console.error("Error fetching partner payments:", error);
      return { data: [], totalCount: 0 };
    }
  } // Acciones (incluye Comprobante)
  const paymentActions: ActionItem<PaymentDynamicTable>[] = [
    {
      label: "Comprobante",
      action: (row) => {
        if (row.file_url && row.file_url !== "stripe_payment") {
          window.open(row.file_url, "_blank");
        }
      },
      hidden: (row) => !row.file_url || row.file_url === "stripe_payment",
    },
  ];

  const columns: ColumnDef<PaymentDynamicTable>[] = [
    // Columna de acciones como en admin
    createActionsColumn(paymentActions),

    {
      accessorKey: "id",
      header: "ID",
      size: 80,
    },
    {
      accessorKey: "voucher_quantity",
      header: "Cantidad de Vouchers",
      size: 160,
      meta: {
        filterType: "number",
        numberOptions: { operators: true, min: 0 },
      },
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
      meta: {
        filterType: "number",
        numberOptions: { operators: true, min: 0 },
      },
      cell: ({ row }) => {
        const val = row.getValue("unit_price") as number;
        return val ? (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300/50">
              {formatUSD(val)}
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
      meta: {
        filterType: "number",
        numberOptions: { operators: true, min: 0 },
      },
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
        const formattedDate = val ? formatDateSafe(val as string) : "-";

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
        const formattedDate = val ? formatDateSafe(val as string) : null;

        if (!val) {
          return (
            <div className="text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-300/50">
                Sin vencimiento
              </span>
            </div>
          );
        }

        // (Si quieres cambiar colores, aquí)
        return (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300/50">
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
        const extensionUsed = row.original.extension_used;
        const formattedDate = val ? formatDateSafe(val as string) : null;

        if (!val) {
          return (
            <div className="text-center">
              <span className="text-gray-500">No programada</span>
            </div>
          );
        }

        return (
          <div className="text-center">
            <span
              className={`text-sm ${
                extensionUsed ? "text-green-700 font-medium" : "text-gray-700"
              }`}
            >
              {formattedDate}
            </span>
            {extensionUsed && (
              <div className="mt-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50">
                  ✓ Consumida
                </span>
              </div>
            )}
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
        const extensionUsed = row.original.extension_used;

        const extensionDate = extensionRaw ? new Date(extensionRaw) : null;
        const expirationDate = expirationRaw ? new Date(expirationRaw) : null;
        const today = new Date();

        const alreadyExtended = extensionUsed === true;
        const canExtend =
          !alreadyExtended &&
          extensionDate &&
          expirationDate &&
          today >= new Date(extensionDate.toDateString()) &&
          today <= new Date(expirationDate.toDateString()) &&
          extensionPriceInfo.exists &&
          extensionPriceInfo.isValid;

        const getButtonText = () => {
          if (alreadyExtended) return "Ya extendido";
          if (!extensionPriceInfo.exists) return "Sin config";
          if (!extensionPriceInfo.isValid) return "Precio inválido";
          if (!canExtend) return "No disponible";
          return "Extender vouchers";
        };

        const getTooltipText = () => {
          if (alreadyExtended) return "Este pago ya ha sido extendido";
          if (!extensionPriceInfo.exists)
            return "El precio de extensión no está configurado";
          if (!extensionPriceInfo.isValid)
            return "El precio de extensión no es válido";
          if (!canExtend)
            return "Solo se puede extender durante el período de extensión";
          return "Extender vouchers sin asignar por 1 año. El precio se calculará en checkout.";
        };

        return (
          <div className="text-center">
            <span
              onClick={
                canExtend
                  ? async () => {
                      try {
                        const res = await fetch("/api/checkout/extension", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ payment_id: paymentId }),
                        });

                        const data = await res.json();

                        if (res.ok) {
                          const redirectUrl =
                            data.checkout_url || data.url || data.checkoutUrl;
                          if (redirectUrl) {
                            window.location.href = redirectUrl;
                          } else {
                            toast.error("No se generó URL de checkout");
                          }
                        } else {
                          toast.error(
                            data.error ||
                              data.message ||
                              "Error al crear checkout"
                          );
                        }
                      } catch (error) {
                        console.error("Error al procesar extensión:", error);
                        toast.error(
                          "Error inesperado al procesar la extensión"
                        );
                      }
                    }
                  : undefined
              }
              title={getTooltipText()}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                canExtend
                  ? "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-300/50 hover:from-purple-200 hover:to-violet-200 hover:shadow-sm cursor-pointer"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {getButtonText()}
            </span>
          </div>
        );
      },
    },
    {
      id: "comprobante_status",
      header: "Comprobante",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const hasReceipt = Boolean(
          row.original.file_url !== null &&
            row.original.file_url !== "stripe_payment"
        );
        return (
          <div className="flex justify-center items-center">
            <span
              title={hasReceipt ? "Con comprobante" : "Sin comprobante"}
              aria-label={hasReceipt ? "Con comprobante" : "Sin comprobante"}
              className={`inline-block rounded-full ${
                hasReceipt ? "bg-green-500" : "bg-gray-300"
              } h-3.5 w-3.5`}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
        </div>

        {/* Tabla */}
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
