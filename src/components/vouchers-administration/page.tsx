"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { UserRowType } from "@/modules/auth/table";
import { DataTable } from "@/components/data-table/data-table";
import {
  createActionsColumn,
  type ActionItem,
} from "@/components/data-table/action-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus } from "lucide-react";
import { GeneralLoader } from "@/components/general-loader";
import { DataVoucherTable } from "@/modules/vouchers/types";
import PartnerDetail from "@/components/partner-detail";
import { Button } from "@/components/ui/button";

const formatLocalDate = (iso: string) => {
  if (!iso) return "No hay fecha";
  const [year, month, day] = iso.split("T")[0].split("-");
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeColor = (statusName: string) => {
  if (!statusName) return "text-gray-400";

  const status = statusName.toLowerCase();

  if (status.includes("activo") || status.includes("disponible")) {
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50";
  }
  if (status.includes("usado") || status.includes("utilizado")) {
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300/50";
  }
  if (status.includes("expirado") || status.includes("vencido")) {
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300/50";
  }
  if (status.includes("pendiente")) {
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300/50";
  }

  return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-300/50";
};

export default function VoucherAdministrationPage() {
  const { getUser } = useUserStore();
  const [partnerData, setPartnerData] = useState<any | null>(null);
  const [voucherAvailable, setVoucherAvailable] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const loadPartner = async () => {
      const partnerId = searchParams.get("partner_id");

      if (partnerId) {
        // Vista de admin
        const resPartner = await fetch(`/api/partners?id=${partnerId}`);
        const jsonPartner = await resPartner.json();
        setPartnerData(jsonPartner?.data || null);

        const resQty = await fetch(
          `/api/vouchers/quantity?partner_id=${partnerId}`
        );
        const jsonQty = await resQty.json();
        setVoucherAvailable(jsonQty?.data?.voucher_available ?? 0);
      } else {
        // Vista de partner (autenticado)
        const user: UserRowType | null = await getUser();
        if (!user?.id) return;

        const resPartner = await fetch(`/api/partners?id=${user.id}`);
        const jsonPartner = await resPartner.json();
        setPartnerData(jsonPartner?.data || null);

        const resQty = await fetch(
          `/api/vouchers/quantity?partner_id=${user.id}`
        );
        const jsonQty = await resQty.json();
        setVoucherAvailable(jsonQty?.data?.voucher_available ?? 0);
      }
    };

    loadPartner();
  }, [getUser, searchParams]);

  const fetchVouchers = useCallback(
    async (
      params: Record<string, any>
    ): Promise<{ data: DataVoucherTable[]; totalCount: number }> => {
      try {
        if (!partnerData?.id) return { data: [], totalCount: 0 };

        const query: Record<string, any> = {
          page: params.page ?? 1,
          limit_value: params.limit ?? 10,
          order_by: params.order_by ?? "created_at",
          order_dir: params.order_dir ?? "desc",
          filter_partner_id: partnerData.id,
        };

        for (const key in params) {
          if (key.startsWith("filter_")) {
            const value = params[key];
            if (key.endsWith("_op")) {
              query[key] = value;
            } else if (
              !isNaN(value) &&
              key !== "filter_email" &&
              key !== "filter_company_name"
            ) {
              query[key] = Number(value);
            } else {
              query[key] = value;
            }
          }
        }

        const queryParams = new URLSearchParams(query).toString();
        const response = await fetch(`/api/vouchers?${queryParams}`);
        if (!response.ok) {
          throw new Error(`Request failed: ${response.statusText}`);
        }

        const result = await response.json();
        const { data, totalCount } = result.data || { data: [], totalCount: 0 };
        return { data, totalCount };
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        return { data: [], totalCount: 0 };
      }
    },
    [partnerData?.id]
  );

  const voucherActions: ActionItem<DataVoucherTable>[] = [
    {
      label: "Ver detalles",
      icon: Eye,
      action: (voucher) => {
        const partnerId = searchParams.get("partner_id");

        if (partnerId) {
          // Vista de admin
          router.push(
            `/dashboard/admin/partners/${partnerId}/students/${voucher.id}`
          );
        } else {
          // Vista de partner
          router.push(
            `/dashboard/partner/voucher-administration/${voucher.id}`
          );
        }
      },
    },
  ];

  const columns: ColumnDef<DataVoucherTable>[] = [
    createActionsColumn(voucherActions),
    {
      accessorKey: "code",
      header: "Código único",
      size: 150,
      cell: ({ row }) => {
        const code = row.getValue("code") as string;
        return (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-300/50">
              {code}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "certification_name",
      header: "Nombre de certificación",
      size: 250,
      meta: { filterType: "text" },
      cell: ({ row }) => {
        const certName = row.getValue("certification_name") as string;
        return certName ? (
          <span className="text-gray-800 font-medium">{certName}</span>
        ) : (
          <span className="text-gray-400 italic">Campo vacío</span>
        );
      },
    },
    {
      accessorKey: "status_name",
      header: "Estado del voucher",
      size: 150,
      meta: {
        filterType: "text",
      },
      cell: ({ row }) => {
        const statusName = row.getValue("status_name") as string;
        return statusName ? (
          <div className="text-center">
            <span className={getStatusBadgeColor(statusName)}>
              {statusName}
            </span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-gray-400 italic">Sin estado</span>
          </div>
        );
      },
    },
    {
      accessorKey: "purchase_date",
      header: "Fecha de compra",
      size: 180,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        const date = formatLocalDate(row.getValue("purchase_date"));
        return (
          <div className="text-center">
            <span className="text-gray-700">{date}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "expiration_date",
      header: "Fecha de vencimiento",
      size: 180,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        const date = formatLocalDate(row.getValue("expiration_date"));

        return (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300/50">
              {date}
            </span>
          </div>
        );
      },
    },
  ];

  if (!partnerData) return <GeneralLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PartnerDetail partner={partnerData} />

        {!searchParams.get("partner_id") && (
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
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                    Tus Vouchers
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    Gestiona y administra todos tus vouchers de certificación
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (voucherAvailable && voucherAvailable > 0) {
                    router.push("/dashboard/partner/assign-voucher");
                  } else {
                    alert("No tienes vouchers disponibles para asignar.");
                  }
                }}
                className="gap-2 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 border border-purple-400/20 transition-all duration-200"
                disabled={voucherAvailable === 0}
              >
                <Plus size={18} />
                Asignar nuevo voucher
              </Button>
            </div>

            {/* Descripción detallada */}
            <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-200/80 rounded-lg p-4 border border-orange-300/60 shadow-lg shadow-orange-200/40">
              <p className="text-sm text-gray-700 leading-relaxed">
                Aquí puedes ver todos tus vouchers de certificación, verificar
                su estado, fechas de compra y vencimiento. Los vouchers
                disponibles pueden ser asignados a estudiantes, mientras que los
                utilizados ya han sido canjeados.
                {voucherAvailable !== null && (
                  <span className="font-semibold text-orange-800">
                    {" "}
                    Tienes {voucherAvailable} voucher
                    {voucherAvailable !== 1 ? "s" : ""} disponible
                    {voucherAvailable !== 1 ? "s" : ""} para asignar.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Contenedor de la tabla */}
        <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-lg p-6">
          <DataTable columns={columns} fetchDataFn={fetchVouchers} />
        </div>
      </div>
    </div>
  );
}
