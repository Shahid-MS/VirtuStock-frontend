import { useQuery } from "@tanstack/react-query";
import apiClient from "@/API/ApiClient";
import { UserInterface } from "@/Interface/IPO";
import { Page } from "@/Interface/Page";
import { AdminCount } from "@/Interface/Summary";
import { queryKeys } from "./queryKeys";

export const EMPTY_ADMIN_COUNT: AdminCount = {
  totalUsers: 0,
  userPercentageGrowth: 0,
  totalIpos: 0,
  ipoPercentageGrowth: 0,
};

export const useAdminCount = () =>
  useQuery({
    queryKey: queryKeys.admin.count,
    queryFn: async ({ signal }) =>
      (await apiClient.get<AdminCount>("/admin/count", { signal })).data,
    staleTime: 60 * 1000,
  });

export const useAdminUsers = (page: number, size: number) =>
  useQuery({
    queryKey: queryKeys.admin.users(page, size),
    queryFn: async ({ signal }) =>
      (
        await apiClient.get<Page<UserInterface>>("/admin/user", {
          params: { page, size },
          signal,
        })
      ).data,
    placeholderData: (previous) => previous,
    // Promote / delete invalidate this list, so a short cache is safe.
    staleTime: 5 * 60 * 1000,
  });