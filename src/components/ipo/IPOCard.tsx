import { Link } from "react-router";
import Badge from "@/components/ui/badge/Badge";
import { IPOInterface } from "@/Interface/IPO";
import { INRFormat } from "@/Helper/INRHelper";
import { dateFormat } from "@/Helper/dateHelper";
import {
  formatMultiple,
  formatSignedINR,
  gmpStats,
  gmpTone,
  ipoTiming,
  ipoTypeLabel,
  latestGmp,
  minInvestment,
  statusMeta,
  totalSubscription,
} from "@/Helper/ipoHelper";
import IPOVerdict from "./IPOVerdict";

function Metric({
  label,
  value,
  sub,
  valueClass = "text-gray-800 dark:text-white/90",
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="min-w-0 max-w-full">
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">{label}</p>

      <p
        className={`break-words text-sm font-semibold ${valueClass}`}
        title={value}
      >
        {value}
      </p>

      {sub && (
        <p className="text-theme-xs text-gray-400 dark:text-gray-500">{sub}</p>
      )}
    </div>
  );
}

export default function IPOCard({ ipo }: { ipo: IPOInterface }) {
  const stats = gmpStats(ipo, latestGmp(ipo.gmp));
  const total = totalSubscription(ipo.subscriptions);
  const minInvest = minInvestment(ipo);
  const status = statusMeta(ipo.status);
  const timing = ipoTiming(ipo);

  return (
    <Link
      to={`/ipo/${ipo.id}`}
      className="group flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-theme-md sm:p-5 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/40"
    >
      {/* Header: Logo, IPO name and verdict */}
      <div className="flex min-w-0 items-start gap-2 sm:gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white p-1 sm:h-12 sm:w-12 dark:border-gray-800">
          <img
            src={ipo.logo}
            alt={ipo.name}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold leading-5 text-gray-800 sm:text-base dark:text-white/90">
            {ipo.name}
          </h3>

          <p className="mt-0.5 break-words text-theme-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {[ipoTypeLabel(ipo.type), ipo.symbol].filter(Boolean).join(" • ")}
          </p>
        </div>

        <div className="min-w-0 max-w-[42%] shrink">
          <IPOVerdict verdict={ipo.verdict} />
        </div>
      </div>

      {/* Price band */}
      <div className="mt-4 min-w-0">
        <p className="break-words text-lg font-semibold text-gray-800 sm:text-xl dark:text-white/90">
          {INRFormat(ipo.minPrice)} – {INRFormat(ipo.maxPrice)}
        </p>

        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          Price band
          {ipo.minQty ? ` • lot of ${ipo.minQty} shares` : ""}
        </p>
      </div>

      {/* IPO metrics */}
      <div className="mt-4 grid min-w-0 grid-cols-2 gap-x-3 gap-y-3 border-t border-gray-100 pt-4 sm:gap-x-4 dark:border-gray-800">
        <Metric
          label="GMP"
          value={stats ? formatSignedINR(stats.gmp) : "—"}
          sub={stats ? `${stats.percent.toFixed(1)}%` : undefined}
          valueClass={stats ? gmpTone(stats.gmp) : undefined}
        />

        <Metric label="Subscription" value={formatMultiple(total)} />

        <Metric
          label="Est. listing"
          value={stats ? INRFormat(stats.listingPrice) : "—"}
        />

        <Metric
          label="Min investment"
          value={minInvest === null ? "—" : INRFormat(minInvest)}
        />
      </div>

      {/* Status, closing date and view link */}
      <div className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-2 pt-4">
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1">
          <Badge size="sm" color={status.color}>
            {status.label}
          </Badge>

          <span
            className={`break-words text-theme-xs ${
              timing?.urgent
                ? "font-semibold text-error-600 dark:text-error-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {timing ? timing.label : dateFormat(ipo.endDate)}
          </span>
        </div>

        <span className="shrink-0 whitespace-nowrap text-theme-sm font-medium text-brand-500 transition group-hover:translate-x-0.5 dark:text-brand-400">
          View →
        </span>
      </div>
    </Link>
  );
}
