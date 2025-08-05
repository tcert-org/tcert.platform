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
    return "text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full text-xs";
  }
  if (status.includes("usado") || status.includes("utilizado")) {
    return "text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full text-xs";
  }
  if (status.includes("expirado") || status.includes("vencido")) {
    return "text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full text-xs";
  }
  if (status.includes("pendiente")) {
    return "text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-full text-xs";
  }

  return "text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full text-xs";
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
    },
    {
      accessorKey: "certification_name",
      header: "Nombre de certificación",
      size: 250,
      meta: { filterType: "text" },
      cell: ({ row }) =>
        row.getValue("certification_name") || (
          <span className="text-gray-400 italic">Campo vacío</span>
        ),
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
          <span className={`font-medium ${getStatusBadgeColor(statusName)}`}>
            {statusName}
          </span>
        ) : (
          <span className="text-gray-400 italic">Sin estado</span>
        );
      },
    },
    {
      accessorKey: "purchase_date",
      header: "Fecha de compra",
      size: 180,
      meta: { filterType: "date" },
      cell: ({ row }) => formatLocalDate(row.getValue("purchase_date")),
    },
    {
      accessorKey: "expiration_date",
      header: "Fecha de vencimiento",
      size: 180,
      meta: { filterType: "date" },
      cell: ({ row }) => formatLocalDate(row.getValue("expiration_date")),
    },
  ];

  if (!partnerData) return <GeneralLoader />;

  return (
    <>
      <PartnerDetail partner={partnerData} />
      {!searchParams.get("partner_id") && (
        <div className="flex items-center justify-between mt-8">
          <h2 className="text-3xl font-bold">Tus vouchers</h2>
          <Button
            onClick={() => {
              if (voucherAvailable && voucherAvailable > 0) {
                router.push("/dashboard/partner/assign-voucher");
              } else {
                alert("No tienes vouchers disponibles para asignar.");
              }
            }}
            className="gap-2"
            disabled={voucherAvailable === 0}
          >
            <Plus size={18} />
            Asignar nuevo voucher
          </Button>
        </div>
      )}

      <section className="mt-3 bg-card rounded-lg border shadow-sm p-6">
        <DataTable columns={columns} fetchDataFn={fetchVouchers} />
      </section>
    </>
  );
}
