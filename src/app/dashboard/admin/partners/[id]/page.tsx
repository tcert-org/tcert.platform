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

export interface Voucher {
  code: string;
  certification_name: string;
  student_name: string;
  student_document: string;
  buyer_email: string;
  available: boolean;
  purchase_date: string;
  expiration_date: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const PartnerDetailPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const [partnerData, setPartnerData] = useState<PartnerForDetail | null>(null);

  const fetchVouchers = async (
    params: FetchParams
  ): Promise<{ data: Voucher[]; totalCount: number }> => {
    try {
      const queryParams = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            ...params,
            partner_id: id,
          }).map(([key, value]) => [key, String(value)])
        )
      ).toString();

      // Hacer la petición al API
      const response = await fetch(
        `/api/request-table/vouchers/?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Log de la respuesta (aunque no se use)
      if (!response.ok) {
        console.error(
          `"request /api/request-table/vouchers/?${queryParams}" was not successful: ${response.statusText}`
        );
      } else {
        const result = await response.json();
        console.log("Respuesta del API de vouchers:", result);
      }

      // Mantener los registros inventados
      const mockVouchers: Voucher[] = [
        {
          code: "VOUCHER-001",
          certification_name: "Certificación en Desarrollo Web",
          student_name: "María González",
          student_document: "12345678-9",
          buyer_email: "empresa@ejemplo.com",
          available: true,
          purchase_date: "2024-01-15T00:00:00Z",
          expiration_date: "2024-07-15T00:00:00Z",
        },
        {
          code: "VOUCHER-002",
          certification_name: "Certificación en Inteligencia Artificial",
          student_name: "Carlos Ruiz",
          student_document: "98765432-1",
          buyer_email: "empresa@ejemplo.com",
          available: true,
          purchase_date: "2023-11-20T00:00:00Z",
          expiration_date: "2024-05-20T00:00:00Z",
        },
        {
          code: "VOUCHER-003",
          certification_name: "Certificación en Ciberseguridad",
          student_name: "Laura Morales",
          student_document: "11223344-5",
          buyer_email: "empresa@ejemplo.com",
          available: false,
          purchase_date: "2023-09-10T00:00:00Z",
          expiration_date: "2024-03-10T00:00:00Z",
        },
      ];

      return {
        data: mockVouchers,
        totalCount: 100,
      };
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      return {
        data: [],
        totalCount: 0,
      };
    }
  };

  const voucherActions: ActionItem<Voucher>[] = [
    {
      label: "Ver detalles",
      icon: Eye,
      action: (voucher: Voucher) => {
        console.log({
          title: "Ver voucher",
          description: `Viendo detalles del voucher ${voucher.id}`,
        });
      },
    },
  ];

  const columns: ColumnDef<Voucher>[] = [
    createActionsColumn(voucherActions),
    {
      accessorKey: "code",
      header: "Código único",
      size: 150,
      enableSorting: true,
    },
    {
      accessorKey: "certification_name",
      header: "Nombre de certificación",
      size: 250,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "student_name",
      header: "Nombre estudiante",
      size: 200,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "student_document",
      header: "N. Documento estudiante",
      size: 180,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "buyer_email",
      header: "Correo de comprador",
      size: 250,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "available",
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
        const isAvailable = row.getValue("available");
        return (
          <div
            className={`font-medium ${
              isAvailable ? "text-green-600" : "text-red-600"
            }`}
          >
            {isAvailable ? "Disponible" : "No disponible"}
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
