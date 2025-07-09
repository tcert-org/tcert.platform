"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  ColumnFiltersState,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { FetchParams } from "@/lib/types";
import { format } from "date-fns";

interface UseDataFetchProps<TData> {
  fetchFn: (
    params: FetchParams
  ) => Promise<{ data: TData[]; totalCount: number }>;
  filters: ColumnFiltersState;
  pagination: PaginationState;
  sorting: SortingState;
}

interface UseDataFetchResult<TData> {
  data: TData[] | null;
  totalCount: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDataFetch<TData>({
  fetchFn,
  filters,
  pagination,
  sorting,
}: UseDataFetchProps<TData>): UseDataFetchResult<TData> {
  const [data, setData] = useState<TData[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filterParams: FetchParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        order_by: sorting[0]?.id ?? "created_at",
        order_dir: sorting[0]?.desc ? "desc" : "asc",
      };

      filters.forEach((filter) => {
        const filterValue = filter.value;

        if (
          filterValue instanceof Date ||
          (typeof filterValue === "string" && filterValue.includes("T"))
        ) {
          const formattedDate = format(new Date(filterValue), "yyyy-MM-dd");
          filterParams[`filter_${filter.id}`] = formattedDate;
        } else if (
          typeof filterValue === "string" &&
          filterValue.includes(":")
        ) {
          const [operator, value] = filterValue.split(":");
          filterParams[`filter_${filter.id}_op`] = operator;
          filterParams[`filter_${filter.id}`] = value;
        } else {
          filterParams[`filter_${filter.id}`] = filterValue;
        }
      });

      const result = await fetchFn(filterParams);
      setData(result.data);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, filters, pagination, sorting]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, totalCount, isLoading, error, refetch };
}
