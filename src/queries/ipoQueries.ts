import { keepPreviousData, useQuery } from "@tanstack/react-query";
import apiClient from "@/API/ApiClient";
import { IPOInterface } from "@/Interface/IPO";
import { queryKeys } from "./queryKeys";

const asList = (data: unknown): IPOInterface[] => {
  if (Array.isArray(data)) return data as IPOInterface[];
  const content = (data as { content?: IPOInterface[] } | null)?.content;
  return Array.isArray(content) ? content : [];
};

/** Open IPOs — shared by Home, the Open IPOs page, etc. One request, cached. */
export const useOpenIpos = () =>
  useQuery({
    queryKey: queryKeys.ipos.open,
    queryFn: async ({ signal }) =>
      asList(
        (await apiClient.get("/ipo/status", { params: { status: "open" }, signal }))
          .data
      ),
    staleTime: 2 * 60 * 1000,
  });

/** Upcoming IPOs — optional; fails silently if the backend doesn't support it. */
export const useUpcomingIpos = () =>
  useQuery({
    queryKey: queryKeys.ipos.upcoming,
    queryFn: async ({ signal }) => {
      const res = await apiClient.get("/ipo/status", {
        params: { status: "upcoming" },
        skipErrorToast: true,
        signal,
      });
      // Guard against a backend that ignores unknown filters.
      return asList(res.data).filter(
        (ipo) => (ipo.status ?? "").toUpperCase() === "UPCOMING"
      );
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

/**
 * `fresh` forces a refetch on mount even when cached data exists. Use it for
 * screens that edit the IPO (admin) so they never start from stale values.
 */
export const useIpoDetail = (id?: string, options?: { fresh?: boolean }) =>
  useQuery({
    queryKey: queryKeys.ipo.detail(id),
    queryFn: async ({ signal }) =>
      (await apiClient.get(`/ipo/${id}`, { signal })).data as IPOInterface,
    enabled: !!id,
    retry: false,
    staleTime: 60 * 1000,
    refetchOnMount: options?.fresh ? "always" : true,
  });

/** Full GMP history (the /gmp endpoint returns the IPO with all GMP rows). */
export const useIpoGmp = (id?: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.ipo.gmp(id),
    queryFn: async ({ signal }) =>
      (await apiClient.get(`/ipo/${id}/gmp`, { signal })).data as IPOInterface,
    enabled: !!id && enabled,
    retry: false,
    staleTime: 2 * 60 * 1000,
  });

interface AppliedStatus {
  applied: boolean;
  appliedIpoId?: string;
}

/** Cached "has this user applied to this IPO?" lookup. */
export const useAppliedStatus = (ipoId?: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.appliedStatus.byIpo(ipoId),
    queryFn: async ({ signal }) =>
      (
        await apiClient.get("/user/check-applied-ipo", {
          params: { ipoId },
          signal,
        })
      ).data as AppliedStatus,
    enabled: !!ipoId && enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

/** Debounced name/symbol search. Old results stay visible while a new term loads. */
export const useIpoSearch = (term: string) =>
  useQuery({
    queryKey: queryKeys.search(term),
    queryFn: async ({ signal }) => {
      const res = await apiClient.get("/ipo/search", {
        params: { query: term },
        signal,
      });
      return Array.isArray(res.data) ? (res.data as IPOInterface[]) : [];
    },
    enabled: term.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
