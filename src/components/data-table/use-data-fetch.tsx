"use client";

import { useState, useCallback } from "react";
import type {
  ColumnFiltersState,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { FetchParams } from "@/lib/types";

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
      // Construct filter parameters
      const filterParams: FetchParams = {
        page: 0,
        limit: 0,
        order_by: "",
        order_dir: "asc",
      };

      // Add filters for each column
      filters.forEach((filter) => {
        const filterValue = filter.value;

        // Handle number filters with operators
        if (typeof filterValue === "string" && filterValue.includes(":")) {
          const [operator, value] = filterValue.split(":");
          filterParams[`filter_${filter.id}_op`] = operator;
          filterParams[`filter_${filter.id}`] = value;
        } else {
          filterParams[`filter_${filter.id}`] = filterValue;
        }
      });

      // Add pagination parameters
      filterParams.page = pagination.pageIndex + 1; // Convert to 1-based for API
      filterParams.limit = pagination.pageSize;

      // Add sorting parameters
      if (sorting.length > 0) {
        filterParams.order_by = sorting[0].id;
        filterParams.order_dir = sorting[0].desc ? "desc" : "asc";
      } else {
        // Default sort
        filterParams.order_by = "created_at";
        filterParams.order_dir = "desc";
      }

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

  // Initial fetch
  useState(() => {
    fetchData();
  });

  return { data, totalCount, isLoading, error, refetch };
}
