"use client";

import { useState, useEffect } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertCircle,
  RefreshCw,
  SearchX,
  Filter,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataFetch } from "./use-data-fetch";
import { FilterBuilder } from "./filter-builder";
import { Badge } from "@/components/ui/badge";

type ColumnWithAccessor<TData, TValue> = ColumnDef<TData, TValue> & {
  accessorKey?: string;
};

// Luego, modifica tu interfaz DataTableProps
interface DataTableProps<TData, TValue> {
  columns: ColumnWithAccessor<TData, TValue>[];
  fetchDataFn: (params: any) => Promise<{ data: TData[]; totalCount: number }>;
}

export function DataTable<TData, TValue>({
  columns,
  fetchDataFn,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [draftFilters, setDraftFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data, totalCount, isLoading, error, refetch } = useDataFetch<TData>({
    fetchFn: fetchDataFn,
    filters: columnFilters,
    pagination,
    sorting,
  });
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil((totalCount || 0) / pagination.pageSize),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  // Initialize draft filters from column filters
  useEffect(() => {
    setDraftFilters(columnFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch data when filters, pagination, or sorting changes
  useEffect(() => {
    console.log("🔍 ColumnFilters que se envían:", columnFilters);
    refetch();
  }, [columnFilters, pagination.pageIndex, sorting, refetch]);

  // Apply filters from draft to actual filters
  const applyFilters = () => {
    setColumnFilters(draftFilters);
    setPagination({ ...pagination, pageIndex: 0 }); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setDraftFilters([]);
    setColumnFilters([]);
    setPagination({ ...pagination, pageIndex: 0 }); // Reset to first page
  };

  // Remove a specific filter
  const removeFilter = (id: string) => {
    const newFilters = columnFilters.filter((filter) => filter.id !== id);
    setColumnFilters(newFilters);
    setDraftFilters(newFilters);
  };

  // Get column-specific boolean labels if available
  const getColumnBooleanLabels = (column: any) => {
    if (column?.meta?.booleanOptions) {
      return column.meta.booleanOptions;
    }
    return null;
  };

  const formatFilterValue = (value: any, column: any) => {
    if (column?.meta?.filterType === "boolean") {
      const labels = getColumnBooleanLabels(column);
      return value === "true" ? labels.trueLabel : labels.falseLabel;
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (
      column?.meta?.filterType === "number" &&
      typeof value === "string" &&
      value.includes(":")
    ) {
      const [operator, num] = value.split(":");
      const operatorMap: Record<string, string> = {
        "=": "=",
        "!=": "≠",
        ">": ">",
        ">=": "≥",
        "<": "<",
        "<=": "≤",
      };
      return `${operatorMap[operator] || "="} ${num}`;
    }

    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Filter section with improved layout */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isFilterOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Button>

            {columnFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar Todo
              </Button>
            )}
          </div>

          {/* Active filters display */}
          {columnFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {columnFilters.map((filter) => {
                const column = columns.find(
                  (col) => col.accessorKey === filter.id || col.id === filter.id
                ) as any;
                return (
                  <Badge
                    key={filter.id}
                    variant="secondary"
                    className="px-2 py-1"
                  >
                    <span className="font-medium mr-1">
                      {column?.header ?? "filtro"} :
                    </span>
                    <span className="mr-2">
                      {formatFilterValue(filter.value, column)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(filter.id)}
                      className="h-4 w-4 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Eliminar filtro</span>
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {isFilterOpen && (
          <div className="border rounded-md p-4 mb-6 bg-card">
            <FilterBuilder
              columns={columns}
              draftFilters={draftFilters}
              setDraftFilters={setDraftFilters}
              applyFilters={applyFilters}
            />
          </div>
        )}
      </div>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-medium">
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-1"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className="ml-1 flex h-4 w-4 items-center justify-center">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="animate-pulse">
                  {Array.from({ length: columns.length }).map(
                    (_, cellIndex) => (
                      <TableCell
                        key={`skeleton-cell-${cellIndex}`}
                        className="py-3"
                      >
                        <div className="h-5 bg-muted rounded w-[80%]"></div>
                      </TableCell>
                    )
                  )}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-destructive">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Error al cargar datos</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="mt-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Intentar de nuevo
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={i % 2 === 0 ? "bg-muted/20" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <SearchX className="h-8 w-8 mb-2" />
                    <p>No se encontraron resultados</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          a{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            totalCount || 0
          )}{" "}
          de {totalCount || 0} registros
        </div>

        <div className="flex items-center space-x-2">
          {/* Primera página */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setPagination((prev) => ({
                ...prev,
                pageIndex: 0,
              }));
            }}
            className="h-8 w-8"
            disabled={table.getState().pagination.pageIndex === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex > 0 ? prev.pageIndex - 1 : 0,
              }));
            }}
            className="h-8 w-8"
            disabled={table.getState().pagination.pageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm mx-2">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount() || 1}
          </span>

          {/* Página siguiente */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const maxPage = Math.max(
                0,
                Math.ceil((totalCount || 0) / pagination.pageSize) - 1
              );
              setPagination((prev) => ({
                ...prev,
                pageIndex:
                  prev.pageIndex + 1 <= maxPage ? prev.pageIndex + 1 : maxPage,
              }));
            }}
            className="h-8 w-8"
            disabled={
              table.getState().pagination.pageIndex >=
              Math.max(
                0,
                Math.ceil((totalCount || 0) / pagination.pageSize) - 1
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Última página */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const maxPage = Math.max(
                0,
                Math.ceil((totalCount || 0) / pagination.pageSize) - 1
              );
              setPagination((prev) => ({
                ...prev,
                pageIndex: maxPage,
              }));
            }}
            className="h-8 w-8"
            disabled={
              table.getState().pagination.pageIndex >=
              Math.max(
                0,
                Math.ceil((totalCount || 0) / pagination.pageSize) - 1
              )
            }
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
