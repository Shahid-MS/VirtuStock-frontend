import apiClient from "@/API/ApiClient";
import { IPOInterface } from "@/Interface/IPO";
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  useQuery,
  QueryFunctionContext,
} from "@tanstack/react-query";

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

export interface IpoFilters {
  status: string;
  verdict: string;
  type: string;
}

interface PaginationContextType {
  ipos: IPOInterface[];
  loading: boolean;
  fetching: boolean;
  error: boolean;
  pagination: PaginationState;
  filters: IpoFilters;
  setFilters: (filters: IpoFilters) => void;
  setPageNumber: (page: number) => void;
}

export const PaginationContext =
  createContext<PaginationContextType | null>(null);

export const usePagination = () => {
  const context = useContext(PaginationContext);

  if (!context) {
    throw new Error(
      "usePagination must be used within PaginationProvider"
    );
  }

  return context;
};

const PAGE_SIZE = 10;

/**
 * The /ipo endpoint can answer in two shapes:
 *  1. a paged object:  { content: [...], totalPages, totalElements, lastPage }
 *  2. a plain array:   [ ... ]   (this happens for some filtered requests)
 *
 * Both are turned into the paged shape the UI expects. A plain array is split
 * into pages here, so pagination keeps working.
 */
const normalizeResponse = (
  data: unknown,
  pageNumber: number,
  pageSize: number
): IpoPage => {
  // 2. Plain array -> page it on the client.
  if (Array.isArray(data)) {
    const list = data as IPOInterface[];
    const totalPages = Math.ceil(list.length / pageSize);

    return {
      content: list.slice(
        pageNumber * pageSize,
        (pageNumber + 1) * pageSize
      ),
      totalPages,
      totalElements: list.length,
      lastPage: pageNumber >= totalPages - 1,
    };
  }

  if (data && typeof data === "object") {
    const object = data as Record<string, unknown>;

    // 1. Paged object.
    if (Array.isArray(object.content)) {
      return object as IpoPage;
    }

    // The list may be wrapped under another key, e.g. { data: ... }.
    for (const key of ["data", "ipos", "items", "results"]) {
      const inner = object[key];

      if (Array.isArray(inner) || (inner && typeof inner === "object")) {
        const normalized = normalizeResponse(inner, pageNumber, pageSize);

        if (normalized.content) {
          return normalized;
        }
      }
    }
  }

  if (import.meta.env.DEV) {
    console.warn("[IPO list] Unexpected response shape:", data);
  }

  return { content: [], totalPages: 0, totalElements: 0, lastPage: true };
};

const fetchIpos = async ({
  queryKey,
}: QueryFunctionContext): Promise<IpoPage> => {
  const [
    ,
    pageNumber,
    pageSize,
    status,
    verdict,
    type,
  ] = queryKey as [
    string,
    number,
    number,
    string,
    string,
    string
  ];

  const params: Record<string, string | number> = {
    page: pageNumber,
    size: pageSize,
  };

  if (status) {
    params.status = status;
  }

  if (verdict) {
    params.verdict = verdict;
  }

  if (type) {
    params.type = type;
  }

  const response = await apiClient.get<unknown>("/ipo", {
    params,
  });

  return normalizeResponse(response.data, pageNumber, pageSize);
};

export const PaginationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pageNumber, setPageNumber] = useState(0);

  const [filters, setFiltersState] = useState<IpoFilters>({
    status: "",
    verdict: "",
    type: "",
  });

  // Changing a filter always goes back to the first page.
  const setFilters = (nextFilters: IpoFilters) => {
    setPageNumber(0);
    setFiltersState(nextFilters);
  };

  const {
    data,
    isError,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "ipos",
      pageNumber,
      PAGE_SIZE,
      filters.status,
      filters.verdict,
      filters.type,
    ],
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
    [pageNumber, totalPages, totalElements, lastPage]
  );

  return (
    <PaginationContext.Provider
      value={{
        ipos,
        loading: isLoading,
        fetching: isFetching,
        error: isError,
        pagination,
        filters,
        setFilters,
        setPageNumber,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};