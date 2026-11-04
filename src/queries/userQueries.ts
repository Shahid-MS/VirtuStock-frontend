import { useQuery } from "@tanstack/react-query";
import apiClient from "@/API/ApiClient";
import { AppliedIPOInterface } from "@/Interface/IPO";
import { Page } from "@/Interface/Page";
import { MonthlyActivitySummary, MonthlyProfitSummary } from "@/Interface/Summary";
import { queryKeys } from "./queryKeys";

export const EMPTY_ACTIVITY_SUMMARY: MonthlyActivitySummary = {
  month: [],
  applied: [],
  alloted: [],
  totalIpo: [],
};

export const EMPTY_PROFIT_SUMMARY: MonthlyProfitSummary = {
  month: [],
  profit: [],
};

/** Dashboard data changes only when the user edits it (see invalidateUserActivity). */
const USER_DATA_STALE_MS = 60 * 1000;

export const useAppliedIpos = (page: number, size: number) =>
  useQuery({
    queryKey: queryKeys.user.appliedIpos(page, size),
    queryFn: async ({ signal }) =>
      (
        await apiClient.get<Page<AppliedIPOInterface>>("/user/applied-ipo", {
          params: { page, size },
          signal,
        })
      ).data,
    placeholderData: (previous) => previous,
    retry: 1,
    staleTime: USER_DATA_STALE_MS,
  });

export const useMonthlySummary = (year: number) =>
  useQuery({
    queryKey: queryKeys.user.monthlySummary(year),
    queryFn: async ({ signal }) => {
      const res = await apiClient.get<Record<string, MonthlyActivitySummary>>(
        "/user/monthly-summary",
        { params: { year }, signal }
      );
      return res.data?.[`Year-${year}`] ?? EMPTY_ACTIVITY_SUMMARY;
    },
    staleTime: USER_DATA_STALE_MS,
  });

export const useMonthlyProfit = (year: number) =>
  useQuery({
    queryKey: queryKeys.user.monthlyProfit(year),
    queryFn: async ({ signal }) => {
      const res = await apiClient.get<Record<string, MonthlyProfitSummary>>(
        "/user/monthly-summary-profit",
        { params: { year }, signal }
      );
      return res.data?.[`Year-${year}`] ?? EMPTY_PROFIT_SUMMARY;
    },
    staleTime: USER_DATA_STALE_MS,
  });
