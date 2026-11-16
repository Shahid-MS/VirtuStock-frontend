import apiClient from "@/API/ApiClient";
import { IPOInterface } from "@/Interface/IPO";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigationType } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/queries/queryKeys";

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

const fetchIpos = async (
  pageNumber: number,
  pageSize: number,
  { status, verdict, type }: IpoFilters,
  signal?: AbortSignal
): Promise<IpoPage> => {
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
    signal,
  });

  return normalizeResponse(response.data, pageNumber, pageSize);
};

const EMPTY_FILTERS: IpoFilters = { status: "", verdict: "", type: "" };

interface SavedListState {
  pageNumber: number;
  filters: IpoFilters;
}

const readSavedState = (storageKey: string): SavedListState | null => {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;

    const saved = JSON.parse(raw) as Partial<SavedListState>;
    const page = saved.pageNumber;

    if (typeof page !== "number" || !Number.isInteger(page) || page < 0) {
      return null;
    }

    return {
      pageNumber: page,
      filters: {
        status: String(saved.filters?.status ?? ""),
        verdict: String(saved.filters?.verdict ?? ""),
        type: String(saved.filters?.type ?? ""),
      },
    };
  } catch {
    return null;
  }
};

/**
 * @param storageKey Where this list remembers its page and filters for the
 * browser session. Give each route its own key.
 */
export const PaginationProvider = ({
  children,
  storageKey = "ipo-list",
}: {
  children: React.ReactNode;
  storageKey?: string;
}) => {
  // Coming back with the browser's Back/Forward button (e.g. from an IPO's
  // detail page) restores the page and filters the user was on. A normal link
  // click (PUSH), such as the logo, starts from page 1 as usual.
  const navigationType = useNavigationType();
  const [saved] = useState(() =>
    navigationType === "POP" ? readSavedState(storageKey) : null
  );

  const [pageNumber, setPageNumber] = useState(saved?.pageNumber ?? 0);

  const [filters, setFiltersState] = useState<IpoFilters>(
    saved?.filters ?? EMPTY_FILTERS
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ pageNumber, filters })
      );
    } catch {
      // Storage unavailable (private mode / quota): paging still works.
    }
  }, [storageKey, pageNumber, filters]);

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
    queryKey: queryKeys.ipos.list(
      pageNumber,
      PAGE_SIZE,
      filters.status,
      filters.verdict,
      filters.type
    ),
    queryFn: ({ signal }) => fetchIpos(pageNumber, PAGE_SIZE, filters, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
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