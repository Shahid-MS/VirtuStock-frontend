import apiClient from "@/API/ApiClient";
import { IPOInterface } from "@/Interface/IPO";
import { createContext, useContext, useMemo, useState } from "react";
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";

interface PaginationState {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  lastPage: boolean;
}

interface IpoPage {
  content?: IPOInterface[];
  totalPages?: number;
  totalElements?: number;
  lastPage?: boolean;
}

interface PaginationContextType {
  ipos: IPOInterface[];
  /** True only for the very first load (not when switching pages). */
  loading: boolean;
  /** True whenever a request is in flight, including page changes. */
  fetching: boolean;
  error: boolean;
  pagination: PaginationState;
  setPageNumber: (page: number) => void;
}

export const PaginationContext = createContext<PaginationContextType | null>(
  null,
);

export const usePagination = () => useContext(PaginationContext)!;

const PAGE_SIZE = 10;

const fetchIpos = async ({ queryKey }: QueryFunctionContext) => {
  const [, pageNumber, pageSize] = queryKey as [string, number, number];
  const res = await apiClient.get("/ipo", {
    params: {
      page: pageNumber,
      size: pageSize,
    },
  });
  return res.data as IpoPage;
};

export const PaginationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pageNumber, setPageNumber] = useState(0);

  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: ["ipos", pageNumber, PAGE_SIZE],
    queryFn: fetchIpos,
    placeholderData: (previousData) => previousData,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const ipos = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const lastPage = data?.lastPage ?? false;

  const pagination = useMemo<PaginationState>(
    () => ({
      pageNumber,
      pageSize: PAGE_SIZE,
      totalPages,
      totalElements,
      lastPage,
    }),
    [pageNumber, totalPages, totalElements, lastPage],
  );

  return (
    <PaginationContext.Provider
      value={{
        ipos,
        loading: isLoading,
        fetching: isFetching,
        error: isError,
        pagination,
        setPageNumber,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};
