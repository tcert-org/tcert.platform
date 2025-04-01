"use client";
import { PartnerForDetail } from "@/modules/partners/table";
import { useEffect, useState, use } from "react";
import PartnerDetail from "@/components/partner-detail";
import { DataTable } from "@/components/data-table/data-table";
import {
  createActionsColumn,
  type ActionItem,
} from "@/components/data-table/action-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { FetchParams } from "@/lib/types";
import {
  DataVoucherTable,
  ResponseVoucherTable,
} from "@/modules/vouchers/types";
import { GeneralLoader } from "@/components/general-loader";

interface PageProps {
  params: Promise<{ id: string }>;
}

const PartnerDetailPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const [partnerData, setPartnerData] = useState<PartnerForDetail | null>(null);

  const fetchVouchers = async (
    params: FetchParams
  ): Promise<ResponseVoucherTable> => {
    try {
      const response = await fetch(`/api/request-table/vouchers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
          filter_partner_id: id,
        }),
      });

      const result: {
        statusCode: number;
        data: ResponseVoucherTable | null;
        error?: string;
      } = await response.json();

      if (!response.ok || result.statusCode !== 200 || !result.data) {
        console.error(
          "Error getting vouchers:",
          result.error || response.statusText
        );
        return { data: [], totalCount: 0 };
      }

      return {
        data: result.data.data,
        totalCount: result.data.totalCount,
      };
    } catch (error) {
      console.error("Error inesperado al obtener vouchers:", error);
      return { data: [], totalCount: 0 };
    }
  };
  const voucherActions: ActionItem<DataVoucherTable>[] = [
    {
      label: "Ver detalles",
      icon: Eye,
      action: (voucher: DataVoucherTable) => {
        console.log({
          title: "Ver voucher",
          description: `Viendo detalles del voucher ${voucher.code}`,
        });
      },
    },
  ];

  const columns: ColumnDef<DataVoucherTable>[] = [
    createActionsColumn(voucherActions),
    {
      accessorKey: "code",
      header: "Código único",
      size: 150,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "certification_name",
      header: "Nombre de certificación",
      size: 250,
      meta: { filterType: "text" },
      cell: ({ row }) => {
        const value = row.getValue("certification_name");
        return value ? (
          value
        ) : (
          <span className="text-gray-400 italic">Campo vacío</span>
        );
      },
    },
    {
      accessorKey: "student_fullname",
      header: "Nombre estudiante",
      size: 200,
      meta: { filterType: "text" },
      cell: ({ row }) => {
        const value = row.getValue("student_fullname");
        return value ? (
          value
        ) : (
          <span className="text-gray-400 italic">Campo vacío</span>
        );
      },
    },
    {
      accessorKey: "student_document_number",
      header: "N. Documento estudiante",
      size: 180,
      meta: { filterType: "text" },
      cell: ({ row }) => {
        const value = row.getValue("student_document_number");
        return value ? (
          value
        ) : (
          <span className="text-gray-400 italic">Campo vacío</span>
        );
      },
    },
    {
      accessorKey: "available",
      header: "Estado del voucher",
      size: 150,
      meta: {
        filterType: "boolean",
        booleanOptions: {
          trueLabel: "Disponible",
          falseLabel: "Usado o vencido",
        },
      },
      cell: ({ row }) => {
        const isAvailable = row.getValue("available");
        return (
          <div
            className={`font-medium ${
              isAvailable ? "text-green-600" : "text-red-600"
            }`}
          >
            {isAvailable ? "Disponible" : "Usado o vencido"}
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
        return new Date(row.getValue("purchase_date")).toLocaleDateString(
          "es-ES",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );
      },
    },
    {
      accessorKey: "expiration_date",
      header: "Fecha de vencimiento",
      size: 180,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        return new Date(row.getValue("expiration_date")).toLocaleDateString(
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

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        const response = await fetch(`/api/partners?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch partner data");
        }
        const data = await response.json();
        setPartnerData(data?.data || null);
      } catch (error) {
        console.error("Error fetching partner data:", error);
      }
    };

    fetchPartnerData();
  }, [id]);

  if (!partnerData) {
    return <GeneralLoader />;
  }
  return (
    <>
      {partnerData && (
        <>
          <PartnerDetail partner={partnerData} />
          <h2 className="text-3xl font-bold mt-8">
            Vouchers de {partnerData?.company_name ?? ""}
          </h2>
          <p className="text-muted-foreground">
            Visualizar todos los vouchers del partner
          </p>

          <section className="mt-3 bg-card rounded-lg border shadow-sm p-6">
            <DataTable columns={columns} fetchDataFn={fetchVouchers} />
          </section>
        </>
      )}
    </>
  );
};

export default PartnerDetailPage;
