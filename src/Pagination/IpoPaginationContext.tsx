import apiClient from "@/API/ApiClient";
import { IPOInterface } from "@/Interface/IPO";
import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";

interface PaginationState {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  lastPage: boolean;
}

interface PaginationContextType {
  ipos: IPOInterface[];
  loading: boolean;
  error: boolean;
  pagination: PaginationState;
  setPageNumber: (page: number) => void;
}

export const PaginationContext = createContext<PaginationContextType | null>(
  null,
);

export const usePagination = () => useContext(PaginationContext)!;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchIpos = async ({ queryKey }: QueryFunctionContext) => {
  const [, pageNumber, pageSize] = queryKey as [string, number, number];
  await sleep(200);
  const res = await apiClient.get("/ipo", {
    params: {
      page: pageNumber,
      size: pageSize,
    },
  });
  return res.data;
};

export const PaginationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ipos, setIpos] = useState<IPOInterface[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
    lastPage: false,
  });

  const { data, isError, isFetching } = useQuery({
    queryKey: ["ipos", pagination.pageNumber, pagination.pageSize],
    queryFn: fetchIpos,
    placeholderData: (previousData) => previousData,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data) return;

    setIpos(data.content ?? []);
    setPagination((prev) => ({
      ...prev,
      totalPages: data.totalPages ?? 0,
      totalElements: data.totalElements ?? 0,
      lastPage: data.lastPage ?? false,
    }));
  }, [data]);

  const setPageNumber = (p: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: p }));
  };

  return (
    <PaginationContext.Provider
      value={{
        ipos,
        loading: isFetching,
        error: isError,
        pagination,
        setPageNumber,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};
