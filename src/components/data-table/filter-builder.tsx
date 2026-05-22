"use client";

import { useState } from "react";
import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "./date-picker";

interface FilterBuilderProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  draftFilters: ColumnFiltersState;
  setDraftFilters: (filters: ColumnFiltersState) => void;
  applyFilters: () => void;
}

export function FilterBuilder<TData, TValue>({
  columns,
  draftFilters,
  setDraftFilters,
  applyFilters,
}: FilterBuilderProps<TData, TValue>) {
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  // Get filterable columns (those with filterType)
  const filterableColumns = columns.filter(
    (column: any) => column.meta?.filterType
  );

  // Helper function to get column ID safely
  const getColumnId = (column: ColumnDef<TData, TValue>): string => {
    // If column has id, use it
    if (column.id) return column.id;

    // If it's an AccessorKeyColumnDef, use accessorKey as string
    if ("accessorKey" in column && column.accessorKey) {
      return String(column.accessorKey);
    }

    // For header-only columns that might not have id or accessorKey
    if (typeof column.header === "string") {
      return column.header;
    }

    // Fallback
    return "";
  };

  // Helper function to get column header display text
  const getColumnHeader = (column: ColumnDef<TData, TValue>): string => {
    if (typeof column.header === "string") {
      return column.header;
    }

    if (column.id) {
      return column.id;
    }

    if ("accessorKey" in column && column.accessorKey) {
      return String(column.accessorKey);
    }

    return "";
  };

  // Add a new filter
  const addFilter = () => {
    if (!selectedColumn) return;

    // Don't add duplicate filters
    if (draftFilters.some((filter) => filter.id === selectedColumn)) return;

    const column = columns.find(
      (col) => getColumnId(col) === selectedColumn
    ) as any;
    let defaultValue = "";

    // Set appropriate default value based on filter type
    if (column?.meta?.filterType === "boolean") {
      defaultValue = "true";
    } else if (column?.meta?.filterType === "date") {
      defaultValue = new Date().toISOString();
    } else if (column?.meta?.filterType === "number") {
      defaultValue = "0"; // Default number value
    }

    setDraftFilters([
      ...draftFilters,
      { id: selectedColumn, value: defaultValue },
    ]);

    setSelectedColumn("");
  };

  // Remove a filter
  const removeFilter = (id: string) => {
    setDraftFilters(draftFilters.filter((filter) => filter.id !== id));
  };

  // Update a filter value
  const updateFilterValue = (id: string, value: any) => {
    setDraftFilters(
      draftFilters.map((filter) =>
        filter.id === id ? { ...filter, value } : filter
      )
    );
  };

  // Get column-specific boolean labels if available
  const getColumnBooleanLabels = (column: any) => {
    if (column?.meta?.booleanOptions) {
      return column.meta.booleanOptions;
    }
    return { trueLabel: "Sí", falseLabel: "No" };
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium mb-2">Construye tus filtros</div>

      {/* Filter builder */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">
            Seleccionar columna
          </label>
          <Select value={selectedColumn} onValueChange={setSelectedColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar columna" />
            </SelectTrigger>
            <SelectContent>
              {filterableColumns.map((column) => {
                const columnId = getColumnId(column);
                return (
                  <SelectItem
                    key={columnId}
                    value={columnId}
                    disabled={draftFilters.some(
                      (filter) => filter.id === columnId
                    )}
                  >
                    {getColumnHeader(column)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={addFilter}
          disabled={!selectedColumn}
          className="mb-0.5"
        >
          <Plus className="h-4 w-4 mr-1" />
          Añadir Filtro
        </Button>
      </div>

      {/* Active draft filters */}
      {draftFilters.length > 0 && (
        <div className="space-y-4 mt-4 pt-4 border-t">
          <div className="text-sm font-medium">Filtros activos</div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {draftFilters.map((filter) => {
              const column = columns.find(
                (col) => getColumnId(col) === filter.id
              ) as any;
              const columnBooleanLabels = getColumnBooleanLabels(column);
              const filterType = column?.meta?.filterType || "text";
              const numberOptions = column?.meta?.numberOptions || {};

              return (
                <div
                  key={filter.id}
                  className="flex flex-col space-y-1.5 p-3 border rounded-md relative"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(filter.id)}
                    className="absolute right-1 top-1 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {getColumnHeader(column) || filter.id}
                  </div>

                  {renderFilterInput(
                    filterType,
                    filter.value,
                    (value) => updateFilterValue(filter.id, value),
                    columnBooleanLabels,
                    numberOptions
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDraftFilters([])}>
              Restablecer
            </Button>
            <Button onClick={applyFilters}>Aplicar Filtros</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderFilterInput(
  filterType: string,
  value: any,
  onChange: (value: any) => void,
  booleanLabels: { trueLabel: string; falseLabel: string },
  numberOptions?: {
    min?: number;
    max?: number;
    step?: number;
    operators?: boolean;
  }
) {
  switch (filterType) {
    case "text":
      return (
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ingrese filtro"
          className="w-sm"
        />
      );

    case "boolean":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">{booleanLabels.trueLabel}</SelectItem>
            <SelectItem value="false">{booleanLabels.falseLabel}</SelectItem>
          </SelectContent>
        </Select>
      );

    case "number":
      // Check if we should show operator selection
      if (numberOptions?.operators) {
        const [operator, num] = (value || "=:0").split(":");

        return (
          <div className="flex gap-2">
            <Select
              value={operator}
              onValueChange={(op) => onChange(`${op}:${num}`)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="=">Igual a</SelectItem>
                <SelectItem value="!=">Diferente de</SelectItem>
                <SelectItem value=">">Mayor que</SelectItem>
                <SelectItem value=">=">Mayor o igual que</SelectItem>
                <SelectItem value="<">Menor que</SelectItem>
                <SelectItem value="<=">Menor o igual que</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={num || "0"}
              onChange={(e) => onChange(`${operator}:${e.target.value}`)}
              min={numberOptions?.min ?? 0}
              max={
                numberOptions?.max !== undefined ? numberOptions.max : undefined
              }
              step={numberOptions?.step || 1}
              className="w-sm"
            />
          </div>
        );
      } else {
        // Simple number input without operator
        return (
          <Input
            type="number"
            value={value || "0"}
            onChange={(e) => onChange(e.target.value)}
            min={numberOptions?.min ?? 0}
            max={
              numberOptions?.max !== undefined ? numberOptions.max : undefined
            }
            step={numberOptions?.step || 1}
            className="w-sm"
          />
        );
      }

    case "date":
      return (
        <DatePicker
          date={value ? new Date(value) : undefined}
          setDate={(date) => onChange(date ? date.toISOString() : undefined)}
        />
      );

    default:
      return (
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ingrese filtro"
        />
      );
  }
}
