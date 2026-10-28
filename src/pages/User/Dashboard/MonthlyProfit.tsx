import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useCallback, useEffect, useState } from "react";
import apiClient from "@/API/ApiClient";

interface MonthlySummaryData {
  month: string[];
  profit: number[];
}

const emptySummary: MonthlySummaryData = {
  month: [],
  profit: [],
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCompactINR = (value: number) => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 10000000) {
    return `${sign}₹${(absValue / 10000000).toFixed(1)}Cr`;
  }

  if (absValue >= 100000) {
    return `${sign}₹${(absValue / 100000).toFixed(1)}L`;
  }

  if (absValue >= 1000) {
    return `${sign}₹${(absValue / 1000).toFixed(1)}K`;
  }

  return formatINR(value);
};

export default function MonthlyProfit() {
  const currentYear = new Date().getFullYear();

  const [monthlyProfit, setMonthlyProfit] =
    useState<MonthlySummaryData>(emptySummary);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProfit = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await apiClient.get(
        `/user/monthly-summary-profit?year=${selectedYear}`
      );

      setMonthlyProfit(
        response.data?.[`Year-${selectedYear}`] ?? emptySummary
      );
    } catch (err) {
      console.error("Failed to fetch monthly profit/loss:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    void fetchProfit();
  }, [fetchProfit]);

  const totalProfit = monthlyProfit.profit.reduce(
    (sum, value) => sum + value,
    0
  );

  const profitableMonths = monthlyProfit.profit.filter(
    (value) => value > 0
  ).length;

  const lossMonths = monthlyProfit.profit.filter(
    (value) => value < 0
  ).length;

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      background: "transparent",
      parentHeightOffset: 0,
      animations: {
        enabled: true,
        speed: 500,
      },
    },

    colors: ["#10B981"],

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "48%",
        borderRadius: 5,
        borderRadiusApplication: "end",
        colors: {
          ranges: [
            {
              from: -Number.MAX_SAFE_INTEGER,
              to: -0.01,
              color: "#F04438",
            },
            {
              from: 0,
              to: Number.MAX_SAFE_INTEGER,
              color: "#10B981",
            },
          ],
        },
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      show: false,
    },

    xaxis: {
      categories: monthlyProfit.month,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#6B7280",
          fontFamily: "Outfit, sans-serif",
        },
      },
      tooltip: {
        enabled: false,
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
        },
        formatter: (value) => formatCompactINR(value),
      },
    },

    legend: {
      show: false,
    },

    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      yaxis: {
        lines: { show: true },
      },
    },

    annotations: {
      yaxis: [
        {
          y: 0,
          borderColor: "#9CA3AF",
          strokeDashArray: 3,
        },
      ],
    },

    tooltip: {
      enabled: true,
      theme: "light",
      shared: false,
      intersect: false,
      followCursor: false,
      style: {
        fontSize: "13px",
        fontFamily: "Outfit, sans-serif",
      },
      marker: {
        show: true,
      },
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => formatINR(value),
        title: {
          formatter: () => "P/L: ",
        },
      },
    },

    states: {
      hover: {
        filter: {
          type: "lighten",
          value: 0.08,
        },
      },
      active: {
        filter: {
          type: "darken",
          value: 0.05,
        },
      },
    },

    noData: {
      text: "No profit/loss data available",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#6B7280",
        fontSize: "14px",
      },
    },

    responsive: [
      {
        breakpoint: 640,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "58%",
            },
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Profit/Loss",
      data: monthlyProfit.profit,
    },
  ];

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Portfolio performance
          </p>

          <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            Monthly Profit/Loss
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your monthly returns at a glance
          </p>
        </div>

        <select
          aria-label="Select profit and loss year"
          value={selectedYear}
          onChange={(event) =>
            setSelectedYear(Number(event.target.value))
          }
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          {Array.from(
            { length: 5 },
            (_, index) => currentYear - index
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {!loading && !error && (
        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Net P/L · {selectedYear}
          </p>

          <p
            className={`mt-1 break-words text-2xl font-bold ${
              totalProfit > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : totalProfit < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-800 dark:text-white"
            }`}
          >
            {totalProfit > 0 ? "+" : ""}
            {formatINR(totalProfit)}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {profitableMonths} profitable months
            </span>

            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {lossMonths} loss-making months
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 min-w-0 overflow-visible">
        {loading ? (
          <div className="space-y-4 py-5">
            <div className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06]" />
            <div className="h-[180px] animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06]" />
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unable to load profit/loss data.
            </p>

            <button
              type="button"
              onClick={() => void fetchProfit()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <Chart
            options={options}
            series={series}
            type="bar"
            height={260}
            width="100%"
          />
        )}
      </div>

      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        Hover over a bar to inspect its monthly P/L.
      </p>
    </div>
  );
}