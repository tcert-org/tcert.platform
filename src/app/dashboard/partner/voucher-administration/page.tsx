"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

export default function VoucherAdministrationPage() {
  const { getUser } = useUserStore();
  const [partnerData, setPartnerData] = useState<any | null>(null);
  const [voucherAvailable, setVoucherAvailable] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadPartner = async () => {
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
    };

    loadPartner();
  }, [getUser]);

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

        // Agrega dinámicamente los filtros que empiecen con filter_
        for (const key in params) {
          if (key.startsWith("filter_")) {
            const value = params[key];

            // Si detectas _op como operador adicional
            if (key.endsWith("_op")) {
              query[key] = value; // Ej: filter_total_vouchers_op: ">="
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
        const response = await fetch(`/api/vouchers?${queryParams}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(
            `"request /api/vouchers?${queryParams}" failed: ${response.statusText}`
          );
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
        router.push(`/dashboard/partner/voucher-administration/${voucher.id}`);
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
      cell: ({ row }) => {
        const value = row.getValue("certification_name");
        return (
          value || <span className="text-gray-400 italic">Campo vacío</span>
        );
      },
    },
    {
      accessorKey: "used",
      header: "Estado del voucher",
      size: 150,
      meta: {
        filterType: "boolean",
        booleanOptions: {
          trueLabel: "Disponible",
          falseLabel: "No disponible",
        },
      },
      cell: ({ row }) => {
        const used = row.getValue("used");
        const isAvailable = used === true;
        return (
          <span
            className={`font-medium ${
              isAvailable ? "text-green-600" : "text-red-600"
            }`}
          >
            {isAvailable ? "Disponible" : "No disponible"}
          </span>
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

      <section className="mt-3 bg-card rounded-lg border shadow-sm p-6">
        <DataTable columns={columns} fetchDataFn={fetchVouchers} />
      </section>
    </>
  );
}
