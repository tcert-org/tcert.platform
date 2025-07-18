"use client";
import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FetchParams } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";

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

  const res = await fetch("/api/exam");
  const data = await res.json();
  return {
    data,
    totalCount: data.length,
  };
}

async function toggleExamActive(id: string, current: boolean) {
  const res = await fetch(`/api/exam/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active: !current }),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el estado.");
}

export default function ExamPage() {
  // Usar un estado para forzar refetch
  const [refreshKey, setRefreshKey] = useState(0);

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
      size: 160,
      cell: ({ row }) => {
        // No usar un estado local, solo llama la función y refresca la tabla
        const [loading, setLoading] = useState(false);

        async function handleToggle() {
          setLoading(true);
          try {
            await toggleExamActive(row.original.id, row.original.active);
            setRefreshKey((prev) => prev + 1); // << Fuerza el refetch de la tabla
          } catch (e) {
            alert("No se pudo cambiar el estado");
          }
          setLoading(false);
        }

        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/admin/exam/details/${row.original.id}`}
              className="flex items-center"
            >
              <Button size="sm" variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Ver detalles
              </Button>
            </Link>
            <Button
              size="sm"
              variant={row.original.active ? "destructive" : "success"}
              className="gap-2"
              onClick={handleToggle}
              disabled={loading}
            >
              {loading ? "..." : row.original.active ? "Desactivar" : "Activar"}
            </Button>
          </div>
        );
      },
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
      {/* Pasar refreshKey como key para forzar remount/refetch */}
      <DataTable key={refreshKey} columns={columns} fetchDataFn={fetchExam} />
    </div>
  );
}
