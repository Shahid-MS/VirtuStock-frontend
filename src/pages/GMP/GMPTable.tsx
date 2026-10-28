import { useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  dateandTimeFormat,
  dateFormat,
} from "../../Helper/dateHelper";

import { INRFormat } from "../../Helper/INRHelper";
import { IPOProps, GMP } from "../../Interface/IPO";

type GMPRecord = GMP;

interface GMPTableProps {
  ipo: NonNullable<IPOProps["ipo"]>;
  history?: GMPRecord[];
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatMoney(value: number | null): string {
  return value === null ? "—" : INRFormat(value);
}

function getGmpColor(value: number | null): string {
  if (value === null || value === 0) {
    return "text-gray-600 dark:text-gray-300";
  }

  return value > 0
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
}

function getGmpPercentage(
  gmp: number | null,
  issuePrice: number | null,
): string {
  if (gmp === null || issuePrice === null || issuePrice <= 0) {
    return "—";
  }

  return `${((gmp / issuePrice) * 100).toFixed(2)}%`;
}

function getGmpMovement(
  currentGmp: number | null,
  previousGmp: number | null,
) {
  if (currentGmp === null || previousGmp === null) {
    return null;
  }

  const difference = currentGmp - previousGmp;

  const changePercentage =
    previousGmp !== 0
      ? (difference / Math.abs(previousGmp)) * 100
      : null;

  if (difference > 0) {
    return {
      symbol: "↑",
      amount: difference,
      changePercentage,
      label: "Increased",
      className: "text-green-600 dark:text-green-400",
    };
  }

  if (difference < 0) {
    return {
      symbol: "↓",
      amount: Math.abs(difference),
      changePercentage,
      label: "Decreased",
      className: "text-red-600 dark:text-red-400",
    };
  }

  return {
    symbol: "→",
    amount: 0,
    changePercentage,
    label: "No change",
    className: "text-gray-500 dark:text-gray-400",
  };
}

function formatRelativeTime(value: unknown): string {
  if (!value) return "Update time unavailable";

  const timestamp = new Date(value as string | number).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Update time unavailable";
  }

  const difference = Date.now() - timestamp;

  if (difference < 0) return "Updated recently";

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Updated just now";

  if (minutes < 60) {
    return `Updated ${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `Updated ${days} day${days === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `Updated ${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(days / 365);

  return `Updated ${years} year${years === 1 ? "" : "s"} ago`;
}

function getTimestamp(record: GMPRecord): number {
  const timestamp = new Date(record.gmpDate).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export default function GMPTable({
  ipo,
  history: suppliedHistory,
}: GMPTableProps) {
  // Preserve the backend order: newest record first.
  const history = suppliedHistory ?? ipo.gmp ?? [];

  const maxPrice = toNumber(ipo.maxPrice);
  const minPrice = toNumber(ipo.minPrice);
  const lotSize = toNumber(ipo.minQty);

  // Calculate movement chronologically without changing displayed order.
  const movementByRecord = useMemo(() => {
    const chronological = [...history].sort(
      (a, b) => getTimestamp(a) - getTimestamp(b),
    );

    return new Map(
      chronological.map((record, index) => {
        const previous = index > 0 ? chronological[index - 1] : null;

        return [
          record,
          getGmpMovement(
            toNumber(record.gmp),
            previous ? toNumber(previous.gmp) : null,
          ),
        ] as const;
      }),
    );
  }, [history]);

  return (
    <section className="w-full min-w-0 space-y-4">
      {/* Table heading */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          GMP History
        </h3>

        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {history.length} record{history.length === 1 ? "" : "s"} available
        </p>
      </div>

      {/* Same table on mobile and desktop with horizontal scrolling */}
      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div
          className="w-full overflow-x-auto overscroll-x-contain"
          role="region"
          aria-label="GMP history table. Scroll horizontally to see all columns."
          tabIndex={0}
        >
          <Table className="min-w-[1050px]">
            <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <TableRow>
                {[
                  "GMP Date",
                  "Issue Price",
                  "GMP",
                  "GMP Change",
                  "Est. Listing Price",
                  "Est. Profit / Lot",
                  "Last Updated",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    isHeader
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {history.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No GMP history yet.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((g, idx) => {
                  const gmp = toNumber(g.gmp);
                  const movement = movementByRecord.get(g);

                  const listingPrice =
                    maxPrice !== null && gmp !== null
                      ? maxPrice + gmp
                      : null;

                  const profit =
                    gmp !== null && lotSize !== null
                      ? gmp * lotSize
                      : null;

                  return (
                    <TableRow
                      key={`${g.gmpDate}-${g.lastUpdated ?? idx}`}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.035]"
                    >
                      {/* GMP Date */}
                      <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {g.gmpDate ? dateFormat(g.gmpDate) : "—"}
                      </TableCell>

                      {/* Issue Price */}
                      <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {minPrice !== null && maxPrice !== null
                          ? `${INRFormat(minPrice)} – ${INRFormat(maxPrice)}`
                          : "—"}
                      </TableCell>

                      {/* GMP and percentage of issue price */}
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`font-semibold ${getGmpColor(gmp)}`}
                          >
                            {gmp === null
                              ? "—"
                              : `${gmp > 0 ? "+" : ""}${INRFormat(gmp)}`}
                          </span>

                          <span className={`text-xs ${getGmpColor(gmp)}`}>
                            {getGmpPercentage(gmp, maxPrice)}
                          </span>
                        </div>
                      </TableCell>

                      {/* GMP change: amount and percentage */}
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        {movement ? (
                          <div
                            className={`flex flex-col items-start gap-1 ${movement.className}`}
                            title={`${movement.label} compared with the previous chronological record`}
                          >
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <span aria-hidden="true">
                                {movement.symbol}
                              </span>
                              {INRFormat(movement.amount)}
                            </span>

                            {movement.changePercentage !== null && (
                              <span className="text-xs font-medium">
                                {movement.changePercentage > 0 ? "+" : ""}
                                {movement.changePercentage.toFixed(2)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Estimated listing price */}
                      <TableCell className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                        {formatMoney(listingPrice)}
                      </TableCell>

                      {/* Estimated profit per lot */}
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`text-sm font-medium ${getGmpColor(profit)}`}
                        >
                          {formatMoney(profit)}
                        </span>
                      </TableCell>

                      {/* Last updated */}
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        {g.lastUpdated ? (
                          <div
                            className="flex flex-col gap-1"
                            title={dateandTimeFormat(g.lastUpdated)}
                          >
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {formatRelativeTime(g.lastUpdated)}
                            </span>

                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {dateandTimeFormat(g.lastUpdated)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        GMP and estimated listing prices are indicative only and do not
        guarantee actual listing performance. Estimated profit is based on GMP
        multiplied by the IPO lot quantity, before applicable costs. GMP Change
        compares each record with the previous chronological observation.
      </p>
    </section>
  );
}
