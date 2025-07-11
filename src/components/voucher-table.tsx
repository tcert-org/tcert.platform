"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Search,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Types for the voucher data structure
 */
interface Student {
  fullname: string;
}

interface Certification {
  name: string;
}

interface Status {
  name: string;
}

interface Voucher {
  id: number;
  code: string;
  email: string;
  available: boolean;
  student: Student | null;
  certification: Certification | null;
  status: Status | null;
  created_at: string;
}

interface VoucherResponse {
  data: Voucher[];
  total: number;
  page: number;
  totalPages: number;
}

interface FilterState {
  id?: string;
  code?: string;
  email?: string;
  available?: boolean | null;
  student?: string;
  certification?: string;
  status?: string;
  created_at?: string;
}

interface SortState {
  orderBy: string;
  orderDir: "ASC" | "DESC";
}

/**
 * Fetches voucher data with filtering, pagination, and sorting
 */
const fetchVouchers = async (
  filters: FilterState = {},
  page = 1,
  limit = 10,
  orderBy = "created_at",
  orderDir: "ASC" | "DESC" = "DESC"
): Promise<VoucherResponse> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      orderBy,
      orderDir,
    });

    Object.entries(filters).forEach(([key, value]) => {
      // Si el valor es null explícitamente, enviamos un parámetro especial
      if (value === null) {
        params.append(`${key}IsNull`, "true");
      } else if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`/api/vouchers?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    throw error;
  }
};

/**
 * Filter component for each column
 */
const ColumnFilter = ({
  column,
  type,
  onFilter,
  value,
  options = [],
}: {
  column: string;
  type: "text" | "boolean" | "date" | "select";
  onFilter: (column: string, value: any) => void;
  value: any;
  options?: { label: string; value: string }[];
}) => {
  const [filterValue, setFilterValue] = useState(value);
  const [dateValue, setDateValue] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const applyFilter = (newValue: any) => {
    setFilterValue(newValue);
    onFilter(column, newValue);
  };

  const clearFilter = () => {
    setFilterValue("");
    setDateValue(undefined);
    onFilter(column, "");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${value ? "text-primary" : ""}`}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtrar</h4>
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={clearFilter}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {type === "text" && (
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Buscar..."
                value={filterValue || ""}
                onChange={(e) => setFilterValue(e.target.value)}
                className="h-8"
              />
              <Button
                size="sm"
                className="h-8"
                onClick={() => applyFilter(filterValue)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}

          {type === "boolean" && (
            <div className="flex items-center space-x-2">
              <Select
                value={String(filterValue)}
                onValueChange={(val) => {
                  // Ajusta esto según cómo espera tu API recibir los valores booleanos
                  const boolValue = val === "all" ? null : val === "true";
                  applyFilter(boolValue);
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "date" && (
            <div className="space-y-2">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => {
                  setDateValue(date);
                  if (date) {
                    applyFilter(format(date, "yyyy-MM-dd"));
                  }
                }}
                initialFocus
                locale={es}
              />
            </div>
          )}

          {type === "select" && (
            <Select
              value={filterValue || ""}
              onValueChange={(val) => applyFilter(val)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Actions menu for each row
 */
const RowActions = ({
  voucher,
  onAction,
}: {
  voucher: Voucher;
  onAction: (action: string, voucher: Voucher) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAction("view", voucher)}>
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("edit", voucher)}>
          Editar
        </DropdownMenuItem>
        {!voucher.available && (
          <DropdownMenuItem onClick={() => onAction("resend", voucher)}>
            Reenviar
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onAction("delete", voucher)}
          className="text-destructive"
        >
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Table skeleton loader
 */
const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: 9 }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-6 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 9 }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-6 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

/**
 * Main VoucherTable component
 */
const VoucherTable = () => {
  const router = useRouter();
  // const searchParams = useSearchParams();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<SortState>({
    orderBy: "created_at",
    orderDir: "DESC",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Options for select filters
  const [filterOptions, setFilterOptions] = useState({
    certification: [] as { label: string; value: string }[],
    status: [] as { label: string; value: string }[],
  });

  // Load data
  useEffect(() => {
    const loadVouchers = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchVouchers(
          filters,
          page,
          limit,
          sort.orderBy,
          sort.orderDir
        );

        console.log("data boton", result.data);

        setVouchers(result.data);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);

        // Extract unique options for select filters
        const certifications = new Set<string>();
        const statuses = new Set<string>();

        // Añadir opción para filtrar por valores nulos
        certifications.add("Sin asignar");
        statuses.add("Sin asignar");

        if (result.data && result.data.length > 0) {
          result.data.forEach((voucher) => {
            if (voucher.certification?.name)
              certifications.add(voucher.certification.name);
            if (voucher.status?.name) statuses.add(voucher.status.name);
          });
        }

        setFilterOptions({
          certification: Array.from(certifications).map((c) => ({
            label: c,
            value: c === "Sin asignar" ? "null" : c,
          })),
          status: Array.from(statuses).map((s) => ({
            label: s,
            value: s === "Sin asignar" ? "null" : s,
          })),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar los vouchers"
        );
        // Establecer valores predeterminados en caso de error
        setVouchers([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadVouchers();
  }, [filters, page, limit, sort]);

  // Handle column filter changes
  const handleFilter = (column: string, value: any) => {
    // Manejar el caso especial para valores nulos
    if (value === "null") {
      setFilters((prev) => ({
        ...prev,
        [column]: null,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [column]: value,
      }));
    }
    setPage(1); // Reset to first page on filter change
  };

  // Handle sorting changes
  const toggleSort = (column: string) => {
    setSort((prev) => ({
      orderBy: column,
      orderDir:
        prev.orderBy === column && prev.orderDir === "ASC" ? "DESC" : "ASC",
    }));
  };

  // Handle row actions
  const handleRowAction = (action: string, voucher: Voucher) => {
    switch (action) {
      case "view":
        router.push(`/vouchers/${voucher.id}`);
        break;
      case "edit":
        router.push(`/vouchers/${voucher.id}/edit`);
        break;
      case "resend":
        // Implement resend logic here
        alert(`Reenviar voucher: ${voucher.code}`);
        break;
      case "delete":
        if (confirm(`¿Estás seguro de eliminar el voucher ${voucher.code}?`)) {
          // Implement delete logic here
          alert(`Voucher eliminado: ${voucher.code}`);
        }
        break;
    }
  };

  // Handle limit change
  const handleLimitChange = (newLimit: string) => {
    setLimit(Number(newLimit));
    setPage(1); // Reset to first page on limit change
  };

  // Generate a badge for status
  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;

    let variant: "default" | "secondary" | "destructive" | "outline" =
      "default";

    switch (status.toLowerCase()) {
      case "activo":
        variant = "default";
        break;
      case "expirado":
        variant = "destructive";
        break;
      case "usado":
        variant = "secondary";
        break;
      default:
        variant = "outline";
    }

    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Vouchers</h2>
            <p className="text-muted-foreground">
              Gestiona los vouchers y sus asignaciones
            </p>
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Button variant="outline" onClick={() => setFilters({})}>
              <Filter className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
            <Button>Crear Voucher</Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-destructive">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        )}

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton rows={limit} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">
                      <div className="flex items-center space-x-1">
                        <span
                          className="cursor-pointer"
                          onClick={() => toggleSort("id")}
                        >
                          ID
                        </span>
                        {sort.orderBy === "id" &&
                          (sort.orderDir === "ASC" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                        <ColumnFilter
                          column="id"
                          type="text"
                          onFilter={handleFilter}
                          value={filters.id}
                        />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span
                          className="cursor-pointer"
                          onClick={() => toggleSort("code")}
                        >
                          Código
                        </span>
                        {sort.orderBy === "code" &&
                          (sort.orderDir === "ASC" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                        <ColumnFilter
                          column="code"
                          type="text"
                          onFilter={handleFilter}
                          value={filters.code}
                        />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span
                          className="cursor-pointer"
                          onClick={() => toggleSort("email")}
                        >
                          Email
                        </span>
                        {sort.orderBy === "email" &&
                          (sort.orderDir === "ASC" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                        <ColumnFilter
                          column="email"
                          type="text"
                          onFilter={handleFilter}
                          value={filters.email}
                        />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span
                          className="cursor-pointer"
                          onClick={() => toggleSort("available")}
                        >
                          Usado
                        </span>
                        {sort.orderBy === "available" &&
                          (sort.orderDir === "ASC" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                        <ColumnFilter
                          column="available"
                          type="boolean"
                          onFilter={handleFilter}
                          value={filters.available}
                        />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span
                          className="cursor-pointer"
                          onClick={() => toggleSort("student.fullname")}
                        >
                          Estudiante
                        </span>
                        {sort.orderBy === "student.fullname" &&
                          (sort.orderDir === "ASC" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                        <ColumnFilter
                          column="student"
                          type="text"
                          onFilter={handleFilter}
                          value={filters.student}
                        />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span
                          className="cursor-pointer"
                          onClick={() => toggleSort("certification.name")}
                        >
                          Certificación
                        </span>
                        {sort.orderBy === "certification.name" &&
                          (sort.orderDir === "ASC" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                        <ColumnFilter
                          column="certification"
                          type="select"
                          onFilter={handleFilter}
                          value={filters.certification}
                          options={filterOptions.certification}
                        />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span
                          className="cursor-pointer"
                          onClick={() => toggleSort("status.name")}
                        >
                          Estado
                        </span>
                        {sort.orderBy === "status.name" &&
                          (sort.orderDir === "ASC" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                        <ColumnFilter
                          column="status"
                          type="select"
                          onFilter={handleFilter}
                          value={filters.status}
                          options={filterOptions.status}
                        />
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span
                          className="cursor-pointer"
                          onClick={() => toggleSort("created_at")}
                        >
                          Fecha Creación
                        </span>
                        {sort.orderBy === "created_at" &&
                          (sort.orderDir === "ASC" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                        <ColumnFilter
                          column="created_at"
                          type="date"
                          onFilter={handleFilter}
                          value={filters.created_at}
                        />
                      </div>
                    </TableHead>

                    <TableHead className="w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        No se encontraron vouchers que coincidan con los
                        filtros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell>{voucher.id}</TableCell>
                        <TableCell>
                          <span className="font-medium">{voucher.code}</span>
                        </TableCell>
                        <TableCell>{voucher.email}</TableCell>
                        <TableCell>
                          <Switch checked={voucher.available} disabled />
                        </TableCell>
                        <TableCell>
                          {voucher.student ? voucher.student.fullname : "—"}
                        </TableCell>
                        <TableCell>
                          {voucher.certification
                            ? voucher.certification.name
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {voucher.status
                            ? getStatusBadge(voucher.status.name)
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(voucher.created_at), "dd/MM/yyyy", {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>
                          <RowActions
                            voucher={voucher}
                            onAction={handleRowAction}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Mostrar</span>
              <Select value={String(limit)} onValueChange={handleLimitChange}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue>{limit}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
              <span>de {total} registros</span>
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 text-sm font-medium">
                  Página {page} de {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherTable;
