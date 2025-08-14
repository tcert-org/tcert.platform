"use client";
import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FetchParams } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";

// Asegúrate que estos nombres coincidan con los campos que retorna tu función SQL
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
    limit_value: params.limit ?? 10,
    order_by: params.order_by ?? "created_at",
    order_dir: params.order_dir ?? "desc",
  };

  if (params.filters) {
    for (const filter of params.filters) {
      const val = filter.value;

      if (filter.id === "active" || filter.id === "simulator") {
        query[`filter_${filter.id}`] =
          val === true || val === "true"
            ? true
            : val === false || val === "false"
            ? false
            : undefined;
      } else if (typeof val === "string" && val.includes(":")) {
        const [op, rawValue] = val.split(":");
        query[`filter_${filter.id}_op`] = op;
        query[`filter_${filter.id}`] = rawValue;
      } else {
        query[`filter_${filter.id}`] = val;
      }
    }
  }

  const search = new URLSearchParams(
    Object.entries(query).reduce(
      (acc, [k, v]) =>
        v !== undefined && v !== null ? { ...acc, [k]: v } : acc,
      {}
    )
  ).toString();

  const res = await fetch(`/api/exam?${search}`);
  if (!res.ok) throw new Error("No se pudieron cargar los exámenes");
  const { data, totalCount } = await res.json();

  return {
    data,
    totalCount,
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

// Componente para las acciones de cada fila
function ExamActionCell({
  row,
  onRefresh,
}: {
  row: any;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await toggleExamActive(row.original.id, row.original.active);
      onRefresh();
    } catch {
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
        <Button
          size="sm"
          variant="outline"
          className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
        >
          <Eye className="w-4 h-4" />
          Ver detalles
        </Button>
      </Link>
      <Button
        size="sm"
        variant={row.original.active ? "destructive" : "default"}
        className={`gap-2 transition-all duration-300 ${
          row.original.active
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        }`}
        onClick={handleToggle}
        disabled={loading}
      >
        {loading ? "..." : row.original.active ? "Desactivar" : "Activar"}
      </Button>
    </div>
  );
}

export default function ExamPage() {
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
      meta: { filterType: "text" },
    },
    {
      accessorKey: "name_exam",
      header: "Nombre del Examen / Simulador",
      size: 200,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "simulator",
      header: "Tipo",
      size: 200,
      meta: {
        filterType: "boolean",
        booleanOptions: {
          trueLabel: "Simulador",
          falseLabel: "Examen",
        },
      },
      cell: ({ row }) => {
        const isSimulator = row.getValue("simulator") as boolean;
        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isSimulator
                  ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300/50"
                  : "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-300/50"
              }`}
            >
              {isSimulator ? "Simulador" : "Examen"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "active",
      header: "Estado",
      size: 200,
      meta: {
        filterType: "boolean",
        booleanOptions: {
          trueLabel: "Activo",
          falseLabel: "Inactivo",
        },
      },
      cell: ({ row }) => {
        const isActive = row.getValue("active") as boolean;
        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isActive
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300/50"
                  : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300/50"
              }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      size: 160,
      cell: ({ row }) => {
        return (
          <ExamActionCell
            row={row}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
          />
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
                <Eye className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                  Gestión de Exámenes
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Administra y configura todos los exámenes y simuladores
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/dashboard/admin/exam/form">
                <Button className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-600/40 border border-orange-400/20 transition-all duration-300 transform hover:scale-105 font-medium">
                  <Plus className="mr-2 w-4 h-4" />
                  Crear Examen
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Contenedor de la tabla */}
        <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-lg p-6">
          <DataTable
            key={refreshKey}
            columns={columns}
            fetchDataFn={fetchExam}
          />
        </div>
      </div>
    </div>
  );
}
