import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useCallback, useEffect, useState } from "react";
import apiClient from "@/API/ApiClient";
import Loading from "@/pages/OtherPage/Loading";

interface SummaryData {
  month: string[];
  applied: number[];
  alloted: number[];
  totalIpo: number[];
}

const emptySummary: SummaryData = {
  month: [],
  applied: [],
  alloted: [],
  totalIpo: [],
};

export default function IPOAlloted() {
  const currentYear = new Date().getFullYear();

  const [summary, setSummary] = useState<SummaryData>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await apiClient.get(
        `/user/monthly-summary?year=${selectedYear}`
      );

      setSummary(
        response.data?.[`Year-${selectedYear}`] ?? emptySummary
      );
    } catch (err) {
      console.error("Failed to fetch IPO summary:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  const totalApplied = summary.applied.reduce(
    (sum, value) => sum + value,
    0
  );

  const totalAlloted = summary.alloted.reduce(
    (sum, value) => sum + value,
    0
  );

  const totalIpos = summary.totalIpo.reduce(
    (sum, value) => sum + value,
    0
  );

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

    colors: ["#10B981", "#465FFF", "#94A3B8"],

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "48%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },

    xaxis: {
      categories: summary.month,
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
      min: 0,
      forceNiceScale: true,
      labels: {
        style: {
          colors: "#6B7280",
        },
        formatter: (value) => Math.round(value).toString(),
      },
    },

    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit, sans-serif",
      fontSize: "12px",
      labels: {
        colors: "#6B7280",
      },
      markers: {
        size: 5,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },

    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      padding: {
        left: 4,
        right: 8,
      },
    },

    fill: {
      opacity: 1,
    },

    tooltip: {
      enabled: true,
      theme: "light",
      shared: true,
      intersect: false,
      followCursor: false,
      hideEmptySeries: true,
      style: {
        fontSize: "13px",
        fontFamily: "Outfit, sans-serif",
      },
      marker: {
        show: true,
      },
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value} IPOs`,
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
      text: "No IPO activity available",
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
          legend: {
            position: "bottom",
            horizontalAlign: "center",
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Allotted",
      data: summary.alloted,
    },
    {
      name: "Applied",
      data: summary.applied,
    },
    {
      name: "Total IPOs",
      data: summary.totalIpo,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Your IPO activity
          </p>

          <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            IPO Application Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monthly applications and allotments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="ipo-summary-year"
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            Year
          </label>

          <select
            id="ipo-summary-year"
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

          <button
            type="button"
            onClick={() => void fetchSummary()}
            disabled={loading}
            aria-label="Refresh IPO activity"
            title="Refresh"
            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <svg
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7v5h-5M4 17v-5h5M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2"
              />
            </svg>
          </button>
        </div>
      </div>

      {!loading && !error && (
        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            {
              label: "Applied",
              value: totalApplied,
              color: "text-indigo-600 dark:text-indigo-400",
            },
            {
              label: "Allotted",
              value: totalAlloted,
              color: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Total IPOs",
              value: totalIpos,
              color: "text-gray-700 dark:text-gray-200",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="min-w-0 rounded-xl border border-gray-100 bg-gray-50/80 p-3 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] sm:p-4"
            >
              <p className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                {item.label}
              </p>

              <p
                className={`mt-1 text-xl font-semibold sm:text-2xl ${item.color}`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 min-w-0 overflow-visible">
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unable to load IPO activity.
            </p>

            <button
              type="button"
              onClick={() => void fetchSummary()}
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
            height={300}
            width="100%"
          />
        )}
      </div>
    </div>
  );
}