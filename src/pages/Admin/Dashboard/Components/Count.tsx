/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/API/ApiClient";
import Badge from "@/components/ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
  PieChartIcon,
} from "@/icons";
import Loading from "@/pages/OtherPage/Loading";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CountData {
  totalUsers: number;
  userPercentageGrowth: number;
  totalIpos: number;
  ipoPercentageGrowth: number;
}

export default function Count() {
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [count, setCount] = useState<CountData>({
    totalUsers: 0,
    userPercentageGrowth: 0,
    totalIpos: 0,
    ipoPercentageGrowth: 0,
  });

  useEffect(() => {
    const fetchCount = async () => {
      console.log("count");
      try {
        const res = await apiClient.get(`/admin/count`);
        setCount(res.data);
      } catch {
        setCount({
          totalUsers: 0,
          userPercentageGrowth: 0,
          totalIpos: 0,
          ipoPercentageGrowth: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, []);

  const handleFetch = async () => {
    if (hasFetched) {
      toast.error("You have already Fetched");
      return;
    }

    try {
      const res = await apiClient.post(`/admin/ipo/fetch`);
      toast.success(res.data.message);
    } catch (err) {
      const error = err as AxiosError<any>;
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message || "Failed to fetch");
      }
    } finally {
      setHasFetched(true);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Users
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {count.totalUsers}
            </h4>
          </div>

          <Badge color={count.userPercentageGrowth >= 0 ? "success" : "error"}>
            {count.userPercentageGrowth >= 0 ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon />
            )}
            {count.userPercentageGrowth}% by Last Month
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <button
            className="relative flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 bg-whitetext-gray-800 dark:text-white/90 hover:bg-gray-50 transition-colors dark:border-gray-800 dark:bg-white/[0.03]"
            onClick={handleFetch}
          >
            <PieChartIcon className="size-6" />
            <span className="text-sm font-medium whitespace-nowrap">Fetch</span>
          </button>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ipos
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {count.totalIpos}
            </h4>
          </div>

          <Badge color={count.ipoPercentageGrowth >= 0 ? "success" : "error"}>
            {count.ipoPercentageGrowth >= 0 ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon />
            )}
            {count.ipoPercentageGrowth}% by Last Month
          </Badge>
        </div>
      </div>
    </div>
  );
}
