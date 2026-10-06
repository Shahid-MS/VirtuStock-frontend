import { useQuery } from "@tanstack/react-query";
import apiClient from "@/API/ApiClient";
import { IPOInterface } from "@/Interface/IPO";

const asList = (data: unknown): IPOInterface[] => {
  if (Array.isArray(data)) return data as IPOInterface[];
  const content = (data as { content?: IPOInterface[] } | null)?.content;
  return Array.isArray(content) ? content : [];
};

/** Open IPOs — shared by Home, the Open IPOs page, etc. One request, cached. */
export const useOpenIpos = () =>
  useQuery({
    queryKey: ["ipos", "open"],
    queryFn: async () => asList((await apiClient.get("/ipo?status=open")).data),
    staleTime: 2 * 60 * 1000,
  });

/** Upcoming IPOs — optional; fails silently if the backend doesn't support it. */
export const useUpcomingIpos = () =>
  useQuery({
    queryKey: ["ipos", "upcoming"],
    queryFn: async () => {
      const res = await apiClient.get("/ipo", {
        params: { status: "upcoming" },
        skipErrorToast: true,
      });
      // Guard against a backend that ignores unknown filters.
      return asList(res.data).filter(
        (ipo) => (ipo.status ?? "").toUpperCase() === "UPCOMING"
      );
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useIpoDetail = (id?: string) =>
  useQuery({
    queryKey: ["ipo", id],
    queryFn: async () =>
      (await apiClient.get(`/ipo/${id}`)).data as IPOInterface,
    enabled: !!id,
    retry: false,
    staleTime: 60 * 1000,
  });

/** Full GMP history (the /gmp endpoint returns the IPO with all GMP rows). */
export const useIpoGmp = (id?: string, enabled = true) =>
  useQuery({
    queryKey: ["ipo-gmp", id],
    queryFn: async () =>
      (await apiClient.get(`/ipo/${id}/gmp`)).data as IPOInterface,
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
    queryKey: ["applied-status", ipoId],
    queryFn: async () =>
      (await apiClient.get(`/user/check-applied-ipo?ipoId=${ipoId}`))
        .data as AppliedStatus,
    enabled: !!ipoId && enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
