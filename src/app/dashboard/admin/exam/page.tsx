"use client";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FetchParams } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Eye } from "lucide-react";

export interface ExamDinamicTable {
  id: string;
  name_exam: string;
  certification_name: string;
  simulator: boolean;
  time_limit: number;
  attempts: number;
  active: boolean;
}

async function fetchExam(
  params: FetchParams
): Promise<{ data: ExamDinamicTable[]; totalCount: number }> {
  // ...Tu lógica fetch (igual que tienes)
  const query: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
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

  // Puedes usar queryParams si lo necesitas en el endpoint real
  // const queryParams = new URLSearchParams(query).toString();
  const res = await fetch("/api/exam");
  const data = await res.json();
  return {
    data,
    totalCount: data.length,
  };
}

export default function ExamPage() {
  const columns: ColumnDef<ExamDinamicTable>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
      enableSorting: false,
    },
    {
      accessorKey: "certification_name",
      header: "Nombre de certificación",
      size: 200,
    },
    {
      accessorKey: "name_exam",
      header: "Nombre del Examen",
      size: 200,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "simulator",
      header: "Tipo",
      size: 200,
      cell: ({ row }) => {
        const isSimulator = row.getValue("simulator") as boolean;
        return (
          <span
            className={
              isSimulator
                ? "text-yellow-600 font-semibold"
                : "text-green-600 font-semibold"
            }
          >
            {isSimulator ? "Simulador" : "Examen"}
          </span>
        );
      },
    },
    {
      accessorKey: "active",
      header: "Estado",
      size: 200,
      cell: ({ row }) => {
        const isActive = row.getValue("active") as boolean;
        return (
          <span
            className={
              isActive
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {isActive ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      size: 90,
      cell: ({ row }) => (
        <Link
          href={`/dashboard/admin/exam/details/${row.original.id}`}
          className="flex items-center"
        >
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver detalles
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">Exámenes</h2>
      <div className="flex justify-end mb-4">
        <Link href="/dashboard/admin/exam/form">
          <Button>
            <Plus className="mr-2" />
            Crear Examen
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} fetchDataFn={fetchExam} />
    </div>
  );
}
