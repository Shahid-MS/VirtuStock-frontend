import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import IPOVerdict from "@/components/ipo/IPOVerdict";
import { IPOCardSkeleton } from "@/components/ipo/Skeleton";
import { INRFormat } from "../../Helper/INRHelper";

import {
  formatMultiple,
  formatSignedINR,
  gmpStats,
  gmpTone,
  ipoTypeLabel,
  latestGmp,
} from "../../Helper/ipoHelper";

import { IPOInterface } from "@/Interface/IPO";
import InternalServerError from "../OtherPage/InternalServerError";
import Pagination from "@/Pagination/Pagination";
import { usePagination } from "@/Pagination/IpoPaginationContext";

const headBase =
  "bg-(--sticky-bg) py-3 font-medium text-gray-500 text-start text-theme-xs shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)] dark:text-gray-400 dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]";

const head = `${headBase} px-2 sm:px-3`;

const cell = "px-2 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sm:px-3";

const rupees = (v?: string | number | null) =>
  v === undefined || v === null || v === "" ? "—" : v;

type SortBy = "" | "GMP" | "SUBSCRIPTION" | "ISSUE_SIZE";
type SortDirection = "DESC";

type SubscriptionCategory = "QIB" | "HNI" | "RETAIL";
type IssueSizeCategory = "FRESH" | "OFS" | "TOTAL";

const subscriptionCategories: SubscriptionCategory[] = ["QIB", "HNI", "RETAIL"];

const issueSizeCategories: IssueSizeCategory[] = ["FRESH", "OFS", "TOTAL"];

const subscriptionLabels: Record<SubscriptionCategory, string> = {
  QIB: "QIB",
  HNI: "HNI",
  RETAIL: "Retail",
};

const issueSizeLabels: Record<IssueSizeCategory, string> = {
  FRESH: "Fresh",
  OFS: "OFS",
  TOTAL: "Total",
};

/** Statuses the list can be filtered by. The order here is the order sent to the API. */
const STATUS_OPTIONS = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "OPEN", label: "Open" },
  { value: "ALLOTMENT_PENDING", label: "Allotment Pending" },
  { value: "ALLOTMENT", label: "Allotment" },
  { value: "LISTING_PENDING", label: "Listing Pending" },
  { value: "LISTED", label: "Listed" },
  { value: "CLOSED", label: "Closed" },
] as const;

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>

      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-white/[0.08] dark:text-gray-200">
        {value}
      </span>
    </div>
  );
}

function SubscriptionMiniStats({
  subscriptions,
}: {
  subscriptions: IPOInterface["subscriptions"];
}) {
  const subscriptionValue = (value?: string | number | null) => {
    if (value === undefined || value === null || value === "") {
      return "0x";
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "0x";
    }

    return formatMultiple(numericValue);
  };

  return (
    <div className="flex min-w-[105px] flex-col gap-1.5 sm:min-w-[140px]">
      <MiniStat label="QIB" value={subscriptionValue(subscriptions?.QIB)} />

      <MiniStat
        label="HNI"
        value={subscriptionValue(subscriptions?.["Non-Institutional"])}
      />

      <MiniStat
        label="Retail"
        value={subscriptionValue(subscriptions?.Retailer)}
      />
    </div>
  );
}

function IssueSizeMiniStats({
  issueSize,
}: {
  issueSize: IPOInterface["issueSize"];
}) {
  return (
    <div className="flex min-w-[105px] flex-col gap-1.5 sm:min-w-[150px]">
      <MiniStat label="Fresh" value={rupees(issueSize?.fresh)} />

      <MiniStat label="OFS" value={rupees(issueSize?.offerForSale)} />

      <MiniStat label="Total" value={rupees(issueSize?.totalIssueSize)} />
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const normalizedStatus = status?.toUpperCase();

  let statusClass =
    "bg-gray-100 text-gray-600 dark:bg-white/[0.08] dark:text-gray-300";

  if (normalizedStatus === "OPEN") {
    statusClass =
      "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400";
  } else if (normalizedStatus === "UPCOMING") {
    statusClass =
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
  } else if (normalizedStatus === "CLOSED") {
    statusClass =
      "bg-gray-100 text-gray-600 dark:bg-white/[0.08] dark:text-gray-300";
  } else if (normalizedStatus === "LISTED") {
    statusClass =
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400";
  } else if (normalizedStatus === "LISTING_PENDING") {
    statusClass =
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
  }

  return (
    <span
      className={`inline-flex max-w-full rounded-md px-1.5 py-0.5 text-center leading-tight text-[9px] font-semibold uppercase tracking-wide sm:px-2 sm:text-[10px] ${statusClass}`}
    >
      {status ? status.replace(/_/g, " ") : "—"}
    </span>
  );
}

function getRelativeIpoDate(
  date?: string | null,
  action: "Opens" | "Closes" = "Closes",
): string | null {
  if (!date) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const todayKey = `${getPart("year")}-${getPart("month")}-${getPart("day")}`;

  const targetKey = date.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetKey)) {
    return null;
  }

  const today = Date.parse(`${todayKey}T00:00:00Z`);
  const target = Date.parse(`${targetKey}T00:00:00Z`);

  if (!Number.isFinite(today) || !Number.isFinite(target)) {
    return null;
  }

  const days = Math.round((target - today) / 86_400_000);

  if (days < 0) return null;
  if (days === 0) return `${action} Today`;
  if (days === 1) return `${action} Tomorrow`;

  return `${action} in ${days} days`;
}

function IPODateHint({ ipo }: { ipo: IPOInterface }) {
  const status = ipo.status?.toUpperCase();

  let label: string | null = null;
  let className = "";

  if (status === "OPEN") {
    label = getRelativeIpoDate(ipo.endDate, "Closes");

    if (label === "Closes Today" || label === "Closes Tomorrow") {
      className =
        "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20";
    }
  } else if (status === "UPCOMING") {
    label = getRelativeIpoDate(ipo.startDate, "Opens");

    if (label === "Opens Tomorrow") {
      className =
        "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20";
    }
  }

  if (
    label !== "Closes Today" &&
    label !== "Closes Tomorrow" &&
    label !== "Opens Tomorrow"
  ) {
    return null;
  }

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-md px-1.5 py-0.5 text-center text-[9px] font-semibold leading-tight sm:px-2 sm:text-[10px] ${className}`}
      title={label}
    >
      {label}
    </span>
  );
}

function SortIndicator({
  active,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  return (
    <span
      aria-hidden="true"
      className={`ml-1 inline-block text-xs ${
        active ? "text-brand-500" : "text-gray-400 dark:text-gray-500"
      }`}
    >
      {active ? "↓" : "↕"}
    </span>
  );
}

const filterSelectClass =
  "min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-500 dark:border-white/[0.1] dark:bg-gray-900 dark:text-gray-200";

/**
 * Multi-choice status filter.
 *
 * `value` is a comma-separated list such as "OPEN,UPCOMING" (empty = all), which
 * is exactly what is sent to the API as `?status=OPEN,UPCOMING`. Changes are
 * only applied when "Apply" is pressed, so picking several statuses triggers a
 * single request. On phones it opens as a bottom sheet.
 */
function StatusMultiSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selected = useMemo(
    () =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [value],
  );

  // Close on outside click / Esc.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open) {
      // Start from what is currently applied.
      setDraft(selected);
    }
    setOpen((current) => !current);
  };

  const toggleDraft = (status: string) => {
    setDraft((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  };

  const apply = () => {
    const next = STATUS_OPTIONS.map((option) => option.value)
      .filter((status) => draft.includes(status))
      .join(",");

    setOpen(false);

    // Skip the request when nothing actually changed.
    if (next !== value) {
      onChange(next);
    }
  };

  const labelFor = (status: string) =>
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  const buttonLabel =
    selected.length === 0
      ? "All Statuses"
      : selected.length <= 2
        ? selected.map(labelFor).join(", ")
        : `${selected.length} statuses`;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Filter by status"
        className={`${filterSelectClass} inline-flex max-w-[220px] items-center gap-2 ${
          selected.length > 0
            ? "border-brand-300 text-brand-600 dark:border-brand-500/50 dark:text-brand-400"
            : ""
        }`}
      >
        <span className="truncate">{buttonLabel}</span>

        {selected.length > 0 && (
          <span className="rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold leading-4 text-white">
            {selected.length}
          </span>
        )}

        <svg
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          {/* Phones: dim the page behind the sheet */}
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          />

          <div
            role="dialog"
            aria-label="Filter by status"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-gray-200 bg-white p-3 shadow-theme-lg dark:border-white/[0.1] dark:bg-gray-900 sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:mt-2 sm:w-64 sm:rounded-xl sm:border sm:p-2"
          >
            <p className="px-3 pb-2 pt-1 text-sm font-semibold text-gray-800 dark:text-white/90 sm:hidden">
              Filter by status
            </p>

            <div
              role="group"
              aria-label="Status options"
              className="max-h-64 overflow-y-auto"
            >
              {STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/[0.05] sm:py-2"
                >
                  <input
                    type="checkbox"
                    checked={draft.includes(option.value)}
                    onChange={() => toggleDraft(option.value)}
                    className="h-4 w-4 rounded border-gray-300 accent-brand-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-2 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setDraft([])}
                disabled={draft.length === 0}
                className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={apply}
                className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-600 active:scale-[0.97]"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getSubscriptionValue(
  ipo: IPOInterface,
  category: SubscriptionCategory,
): number | null {
  const subscriptions = ipo.subscriptions;

  let value: string | number | null | undefined;

  switch (category) {
    case "QIB":
      value = subscriptions?.QIB;
      break;

    case "HNI":
      value = subscriptions?.["Non-Institutional"];
      break;

    case "RETAIL":
      value = subscriptions?.Retailer;
      break;
  }

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = Number(
    String(value).replace(/,/g, "").replace(/x$/i, "").trim(),
  );

  return Number.isFinite(numericValue) ? numericValue : null;
}

function getIssueSizeValue(
  ipo: IPOInterface,
  category: IssueSizeCategory,
): number | null {
  const issueSize = ipo.issueSize;

  let value: string | number | null | undefined;

  switch (category) {
    case "FRESH":
      value = issueSize?.fresh;
      break;

    case "OFS":
      value = issueSize?.offerForSale;
      break;

    case "TOTAL":
      value = issueSize?.totalIssueSize;
      break;
  }

  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const numericString = value.replace(/[₹,\s]/g, "");
  const numericValue = Number(numericString);

  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  const match = value.match(/-?\d+(?:\.\d+)?/);

  if (!match) {
    return null;
  }

  const parsedValue = Number(match[0]);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export default function CompareIPO() {
  const {
    ipos,
    loading,
    fetching,
    error,
    pagination,
    setPageNumber,
    filters,
    setFilters,
  } = usePagination();

  const [sortBy, setSortBy] = useState<SortBy>("");
  const [sortDirection] = useState<SortDirection>("DESC");

  const [subscriptionCategory, setSubscriptionCategory] =
    useState<SubscriptionCategory>("QIB");

  const [issueSizeCategory, setIssueSizeCategory] =
    useState<IssueSizeCategory>("FRESH");

  // GMP: descending -> default.
  const handleGmpSort = () => {
    if (sortBy === "GMP") {
      setSortBy("");
      return;
    }

    setSortBy("GMP");
  };

  // Subscription: QIB DESC -> HNI DESC -> Retail DESC -> default.
  const handleSubscriptionSort = () => {
    if (sortBy !== "SUBSCRIPTION") {
      setSortBy("SUBSCRIPTION");
      setSubscriptionCategory("QIB");
      return;
    }

    const currentIndex = subscriptionCategories.indexOf(subscriptionCategory);

    if (currentIndex < subscriptionCategories.length - 1) {
      setSubscriptionCategory(subscriptionCategories[currentIndex + 1]);
      return;
    }

    setSortBy("");
    setSubscriptionCategory("QIB");
  };

  // Issue Size: Fresh DESC -> OFS DESC -> Total DESC -> default.
  const handleIssueSizeSort = () => {
    if (sortBy !== "ISSUE_SIZE") {
      setSortBy("ISSUE_SIZE");
      setIssueSizeCategory("FRESH");
      return;
    }

    const currentIndex = issueSizeCategories.indexOf(issueSizeCategory);

    if (currentIndex < issueSizeCategories.length - 1) {
      setIssueSizeCategory(issueSizeCategories[currentIndex + 1]);
      return;
    }

    setSortBy("");
    setIssueSizeCategory("FRESH");
  };

  const sortedIpos = useMemo(() => {
    // Preserve backend order when sorting is inactive.
    if (!sortBy) {
      return ipos;
    }

    return [...ipos].sort((first, second) => {
      let firstValue: number | null = null;
      let secondValue: number | null = null;

      if (sortBy === "GMP") {
        const firstStats = gmpStats(first, latestGmp(first.gmp));

        const secondStats = gmpStats(second, latestGmp(second.gmp));

        firstValue = firstStats?.percent ?? null;
        secondValue = secondStats?.percent ?? null;
      } else if (sortBy === "SUBSCRIPTION") {
        firstValue = getSubscriptionValue(first, subscriptionCategory);

        secondValue = getSubscriptionValue(second, subscriptionCategory);
      } else if (sortBy === "ISSUE_SIZE") {
        firstValue = getIssueSizeValue(first, issueSizeCategory);

        secondValue = getIssueSizeValue(second, issueSizeCategory);
      }

      // Missing values stay at the bottom.
      if (firstValue === null && secondValue === null) {
        return 0;
      }

      if (firstValue === null) {
        return 1;
      }

      if (secondValue === null) {
        return -1;
      }

      // Descending order only.
      return secondValue - firstValue;
    });
  }, [ipos, sortBy, subscriptionCategory, issueSizeCategory]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <IPOCardSkeleton />
        <IPOCardSkeleton />
        <IPOCardSkeleton />
      </div>
    );
  }

  if (error) {
    return <InternalServerError />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
          Compare IPOs
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Price, issue size, GMP, subscription and Review side by side.
        </p>
      </div>

      {/* IPO filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Filter by IPO type"
          value={filters.type ?? ""}
          onChange={(e) => {
            setFilters({
              ...filters,
              type: e.target.value,
            });
          }}
          className={filterSelectClass}
        >
          <option value="">All Types</option>
          <option value="EQ">Mainboard</option>
          <option value="SME">SME</option>
        </select>

        {/* Multi-choice: sends ?status=OPEN,UPCOMING (comma separated) */}
        <StatusMultiSelect
          value={filters.status ?? ""}
          onChange={(status) => {
            setFilters({
              ...filters,
              status,
            });
          }}
        />

        <select
          aria-label="Filter by verdict"
          value={filters.verdict ?? ""}
          onChange={(e) => {
            setFilters({
              ...filters,
              verdict: e.target.value,
            });
          }}
          className={filterSelectClass}
        >
          <option value="">All Review</option>
          <option value="STRONG_BUY">Strong Buy</option>
          <option value="BUY">Buy</option>
          <option value="WAIT">Wait</option>
          <option value="AVOID">Avoid</option>
          <option value="NOT_REVIEWED">Not Reviewed</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setFilters({
              status: "",
              verdict: "",
              type: "",
            });
          }}
          disabled={!filters.status && !filters.verdict && !filters.type}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.1] dark:text-gray-300 dark:hover:bg-white/[0.05]"
        >
          Reset Filters
        </button>
      </div>

      {/* Sorting instructions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Click Issue Size, GMP, or Subscription to sort in descending order.
          Click again to change category or reset sorting.
        </p>

        {sortBy && (
          <button
            type="button"
            onClick={() => {
              setSortBy("");
              setSubscriptionCategory("QIB");
              setIssueSizeCategory("FRESH");
            }}
            className="text-xs font-medium text-brand-500 hover:underline"
          >
            Reset sorting
          </button>
        )}
      </div>

      {/* Comparison table */}
      <div
        className="w-0 min-w-full overflow-hidden rounded-xl border border-gray-200 bg-(--sticky-bg) shadow-sm
          [--sticky-bg:#ffffff] [--sticky-hover:#f9fafb]
          dark:border-white/[0.05] dark:[--sticky-bg:#171f2e] dark:[--sticky-hover:#1c2432]"
      >
        <div className="no-scrollbar max-w-full overflow-x-auto overscroll-x-contain">
          <Table className="min-w-[860px] sm:min-w-[1150px]">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className={`${headBase} sticky left-0 z-30 w-[96px] min-w-[96px] max-w-[96px] px-1.5 text-center sm:w-auto sm:min-w-[200px] sm:max-w-none sm:px-4 sm:text-start`}
                >
                  Company
                </TableCell>

                <TableCell isHeader className={`${head} whitespace-nowrap`}>
                  Issue Date
                </TableCell>

                <TableCell isHeader className={`${head} whitespace-nowrap`}>
                  Issue Price
                </TableCell>

                <TableCell isHeader className={`${head} text-center`}>
                  <button
                    type="button"
                    onClick={handleIssueSizeSort}
                    title="Sort by Fresh, OFS or Total issue size in descending order"
                    className="inline-flex items-center whitespace-nowrap hover:text-brand-500"
                  >
                    Issue Size
                    {sortBy === "ISSUE_SIZE" && (
                      <span className="ml-1 text-xs">
                        ({issueSizeLabels[issueSizeCategory]})
                      </span>
                    )}
                    <SortIndicator
                      active={sortBy === "ISSUE_SIZE"}
                      direction={sortDirection}
                    />
                  </button>
                </TableCell>

                <TableCell isHeader className={`${head} whitespace-nowrap`}>
                  <button
                    type="button"
                    onClick={handleGmpSort}
                    title="Sort by GMP percentage in descending order"
                    className="inline-flex items-center whitespace-nowrap hover:text-brand-500"
                  >
                    GMP (%)
                    <SortIndicator
                      active={sortBy === "GMP"}
                      direction={sortDirection}
                    />
                  </button>
                </TableCell>

                <TableCell isHeader className={`${head} text-center`}>
                  <button
                    type="button"
                    onClick={handleSubscriptionSort}
                    title="Cycle through QIB, HNI and Retail subscription sorting in descending order"
                    className="inline-flex items-center whitespace-nowrap hover:text-brand-500"
                  >
                    Subscription
                    {sortBy === "SUBSCRIPTION" && (
                      <span className="ml-1 text-xs">
                        ({subscriptionLabels[subscriptionCategory]})
                      </span>
                    )}
                    <SortIndicator
                      active={sortBy === "SUBSCRIPTION"}
                      direction={sortDirection}
                    />
                  </button>
                </TableCell>

                <TableCell
                  isHeader
                  className={`${head} text-center whitespace-nowrap`}
                >
                  Lot
                </TableCell>

                <TableCell
                  isHeader
                  className={`${head} text-center whitespace-nowrap`}
                >
                  Expected Profit
                </TableCell>

                <TableCell isHeader className={`${head} text-center`}>
                  Review
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sortedIpos.map((ipo) => {
                const stats = gmpStats(ipo, latestGmp(ipo.gmp));

                return (
                  <TableRow
                    key={ipo.id}
                    className="group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    {/* Company */}
                    <TableCell className="sticky left-0 z-10 w-[96px] min-w-[96px] max-w-[96px] bg-(--sticky-bg) px-1.5 py-3 group-hover:bg-(--sticky-hover) sm:w-auto sm:min-w-[200px] sm:max-w-none sm:px-4 sm:py-4">
                      <Link to={`/ipo/${ipo.id}`}>
                        <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:gap-3 sm:text-left">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.04] sm:h-10 sm:w-10 sm:rounded-lg">
                            <img
                              src={ipo.logo}
                              className="h-full w-full object-contain"
                              alt={ipo.name}
                              loading="lazy"
                            />
                          </div>

                          <div className="min-w-0 sm:flex-1">
                            <p className="line-clamp-2 max-w-[84px] break-words text-[10px] font-medium leading-tight text-gray-800 hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400 sm:line-clamp-1 sm:max-w-[140px] sm:text-theme-sm">
                              {ipo.name}
                            </p>

                            {ipoTypeLabel(ipo.type) && (
                              <p className="mt-0.5 text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-400 dark:text-gray-500 sm:hidden">
                                {ipoTypeLabel(ipo.type)}
                              </p>
                            )}

                            <p className="hidden truncate text-theme-xs text-gray-500 dark:text-gray-400 sm:block">
                              {ipoTypeLabel(ipo.type)}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center justify-center gap-1 sm:justify-start">
                              <StatusBadge status={ipo.status} />
                              <IPODateHint ipo={ipo} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </TableCell>

                    {/* Issue Date */}
                    <TableCell className={`${cell} whitespace-nowrap`}>
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {formatDate(ipo.startDate)} -
                        </span>

                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {formatDate(ipo.endDate)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Issue Price */}
                    <TableCell className={`${cell} whitespace-nowrap`}>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {INRFormat(ipo.minPrice)} – {INRFormat(ipo.maxPrice)}
                      </span>
                    </TableCell>

                    {/* Issue Size */}
                    <TableCell className={`${cell} align-middle`}>
                      <IssueSizeMiniStats issueSize={ipo.issueSize} />
                    </TableCell>

                    {/* GMP */}
                    <TableCell className={`${cell} whitespace-nowrap`}>
                      {stats ? (
                        <Link
                          to={`/ipo/gmp/${ipo.id}`}
                          className="inline-flex flex-col"
                        >
                          <span
                            className={`font-semibold ${gmpTone(stats.gmp)}`}
                          >
                            {formatSignedINR(stats.gmp)}
                          </span>

                          <span
                            className={`mt-0.5 text-xs ${
                              stats.percent > 0
                                ? "text-green-600 dark:text-green-400"
                                : stats.percent < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-400"
                            }`}
                          >
                            {stats.percent > 0 ? "+" : ""}
                            {stats.percent.toFixed(2)}%
                          </span>
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* Subscription */}
                    <TableCell className={`${cell} align-middle`}>
                      <SubscriptionMiniStats
                        subscriptions={ipo.subscriptions}
                      />
                    </TableCell>

                    {/* Lot */}
                    <TableCell className={`${cell} text-center font-medium`}>
                      {ipo.minQty ?? "—"}
                    </TableCell>

                    {/* Expected Profit */}
                    <TableCell
                      className={`${cell} text-center whitespace-nowrap`}
                    >
                      {stats ? (
                        <span
                          className={`font-semibold ${gmpTone(
                            stats.gainPerLot,
                          )}`}
                        >
                          {formatSignedINR(stats.gainPerLot)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* Review */}
                    <TableCell className="px-2 py-4 text-center sm:px-4">
                      <IPOVerdict verdict={ipo.verdict} />
                    </TableCell>
                  </TableRow>
                );
              })}

              {sortedIpos.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {fetching
                      ? "Applying filters..."
                      : "No IPOs found for the selected filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 2xl:hidden">
        ← Swipe horizontally to compare all IPO details →
      </p>

      {/* Pagination */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Pagination
          pageNumber={pagination.pageNumber}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          onPageChange={setPageNumber}
        />
      </div>
    </div>
  );
}
