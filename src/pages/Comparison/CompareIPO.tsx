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

import NotFound from "../OtherPage/NotFound";
import InternalServerError from "../OtherPage/InternalServerError";

import Pagination from "@/Pagination/Pagination";
import { usePagination } from "@/Pagination/IpoPaginationContext";

const headBase =
  "bg-(--sticky-bg) py-3 font-medium text-gray-500 text-start text-theme-xs shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)] dark:text-gray-400 dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]";

const head = `${headBase} px-2 sm:px-3`;

const cell = "px-2 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sm:px-3";

const rupees = (v?: string | number | null) =>
  v === undefined || v === null || v === "" ? "—" : v;

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// "4 Oct" — used on phones where the year isn't needed.
const formatShortDate = (date?: string | null) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

const subscriptionValue = (value?: string) => {
  if (value === undefined || value === null || value === "") {
    return "0x";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "0x";
  }

  return formatMultiple(numericValue);
};

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
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
  }

  return (
    <span
      className={`inline-flex max-w-full rounded-md px-1.5 py-0.5 text-center leading-tight text-[9px] font-semibold uppercase tracking-wide sm:px-2 sm:text-[10px] ${statusClass}`}
    >
      {status ? status.replace(/_/g, " ") : "—"}
    </span>
  );
}

export default function CompareIPO() {
  const { ipos, loading, error, pagination, setPageNumber } = usePagination();

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

  if (!ipos.length) {
    return <NotFound />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
          Compare IPOs
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Price, issue size, GMP, subscription and verdict side by side.
        </p>
      </div>

      {/*
        --sticky-bg / --sticky-hover are opaque colours that match the card,
        so the pinned Company column looks identical to the rest of the table.
        (#171f2e = gray-900 page background + the card's 3% white tint.)
      */}
      <div
        className="w-0 min-w-full overflow-hidden rounded-xl border border-gray-200 bg-(--sticky-bg) shadow-sm
          [--sticky-bg:#ffffff] [--sticky-hover:#f9fafb]
          dark:border-white/[0.05] dark:[--sticky-bg:#171f2e] dark:[--sticky-hover:#1c2432]"
      >
        {/* Only this box scrolls sideways (swipe / trackpad / shift+wheel); the page scrolls vertically as normal */}
        <div className="no-scrollbar max-w-full overflow-x-auto overscroll-x-contain">
          <Table className="min-w-[780px] sm:min-w-[1050px]">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className={`${headBase} sticky left-0 z-30 w-[96px] min-w-[96px] max-w-[96px] px-1.5 text-center sm:w-auto sm:min-w-[200px] sm:max-w-none sm:px-4 sm:text-start`}
                >
                  Company
                </TableCell>

                <TableCell
                  isHeader
                  className={`${head} whitespace-nowrap`}
                >
                  Issue Price
                </TableCell>

                <TableCell isHeader className={`${head} text-center`}>
                  Issue Size
                </TableCell>

                <TableCell
                  isHeader
                  className={`${head} whitespace-nowrap`}
                >
                  GMP
                </TableCell>

                <TableCell isHeader className={`${head} text-center`}>
                  Subscription
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
                  Verdict
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {ipos.map((ipo) => {
                const stats = gmpStats(ipo, latestGmp(ipo.gmp));

                return (
                  <TableRow
                    key={ipo.id}
                    className="group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    {/* COMPANY (pinned while scrolling) */}
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

                            {/* Type: phones only (larger screens show it with the dates) */}
                            {ipoTypeLabel(ipo.type) && (
                              <p className="mt-0.5 text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-400 dark:text-gray-500 sm:hidden">
                                {ipoTypeLabel(ipo.type)}
                              </p>
                            )}

                            {/* Bidding dates: no year on phones, full on larger screens */}
                            <p className="whitespace-nowrap text-[9px] leading-tight text-gray-500 dark:text-gray-400 sm:hidden">
                              {formatShortDate(ipo.startDate)} –{" "}
                              {formatShortDate(ipo.endDate)}
                            </p>
                            <p className="hidden truncate text-theme-xs text-gray-500 dark:text-gray-400 sm:block">
                              {ipoTypeLabel(ipo.type)}
                              {ipoTypeLabel(ipo.type) ? " • " : ""}
                              {formatDate(ipo.startDate)} –{" "}
                              {formatDate(ipo.endDate)}
                            </p>

                            <div className="mt-1">
                              <StatusBadge status={ipo.status} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </TableCell>

                    {/* ISSUE PRICE */}
                    <TableCell className={`${cell} whitespace-nowrap`}>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {INRFormat(ipo.minPrice)} – {INRFormat(ipo.maxPrice)}
                      </span>
                    </TableCell>

                    {/* ISSUE SIZE */}
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

                          <span className="mt-0.5 text-xs text-gray-400">
                            {stats.percent.toFixed(2)}%
                          </span>
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* SUBSCRIPTION */}
                    <TableCell className={`${cell} align-middle`}>
                      <SubscriptionMiniStats
                        subscriptions={ipo.subscriptions}
                      />
                    </TableCell>

                    {/* LOT */}
                    <TableCell className={`${cell} text-center font-medium`}>
                      {ipo.minQty ?? "—"}
                    </TableCell>

                    {/* EXPECTED PROFIT */}
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

                    {/* VERDICT */}
                    <TableCell className="px-2 py-4 text-center sm:px-4">
                      <IPOVerdict verdict={ipo.verdict} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 2xl:hidden">
        ← Swipe horizontally to compare all IPO details →
      </p>

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