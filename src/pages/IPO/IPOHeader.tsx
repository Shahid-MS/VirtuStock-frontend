import Badge from "@/components/ui/badge/Badge";
import IPOVerdict from "@/components/ipo/IPOVerdict";
import FreshnessLabel from "@/components/ipo/FreshnessLabel";
import { GMP, IPOInterface } from "@/Interface/IPO";
import { INRFormat } from "@/Helper/INRHelper";
import { dateFormat } from "@/Helper/dateHelper";
import {
  formatMultiple,
  formatSignedINR,
  gmpStats,
  gmpTone,
  ipoTiming,
  ipoTypeLabel,
  minInvestment,
  latestGmp,
  statusMeta,
  totalSubscription,
} from "@/Helper/ipoHelper";
import IPOActions from "./IPOActions";

function KeyMetric({
  label,
  value,
  sub,
  valueClass = "text-gray-800 dark:text-white/90",
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="min-w-0 px-4 py-4 sm:px-6">
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`truncate text-lg font-semibold ${valueClass}`}>{value}</p>
      {sub && <div className="mt-0.5">{sub}</div>}
    </div>
  );
}

export default function IPOHeader({
  ipo,
  gmp,
  showActions = true,
}: {
  ipo: IPOInterface;
  /** Latest GMP; defaults to the newest entry on the IPO itself. */
  gmp?: GMP | null;
  /** Hide Apply / Mark-as-applied buttons (e.g. on admin screens). */
  showActions?: boolean;
}) {
  const stats = gmpStats(ipo, gmp === undefined ? latestGmp(ipo.gmp) : gmp);
  const status = statusMeta(ipo.status);
  const timing = ipoTiming(ipo);
  const minInvest = minInvestment(ipo);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 dark:border-gray-800 lg:h-20 lg:w-20">
              <img
                src={ipo.logo}
                alt={ipo.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 lg:text-2xl">
                {ipo.name}
              </h1>
              <p className="mt-0.5 text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {[ipo.symbol, ipoTypeLabel(ipo.type)].filter(Boolean).join(" • ")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <IPOVerdict verdict={ipo.verdict} size="md" />
                <Badge size="md" color={status.color}>
                  {status.label}
                </Badge>
                {timing && (
                  <span
                    className={`text-sm font-medium ${
                      timing.urgent
                        ? "text-error-600 dark:text-error-400"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {timing.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {showActions && (
            <div className="w-full lg:w-64 lg:shrink-0">
              <IPOActions ipo={ipo} />
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            {INRFormat(ipo.minPrice)} – {INRFormat(ipo.maxPrice)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {minInvest === null
              ? "Price band"
              : `${INRFormat(minInvest)} minimum investment`}
            {ipo.minQty ? ` • ${ipo.minQty} shares per lot` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800 lg:grid-cols-4 lg:divide-y-0">
        <KeyMetric
          label="GMP"
          value={stats ? formatSignedINR(stats.gmp) : "—"}
          valueClass={stats ? gmpTone(stats.gmp) : undefined}
          sub={
            stats ? (
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                {stats.percent.toFixed(1)}% of issue price
              </span>
            ) : undefined
          }
        />
        <KeyMetric
          label="Subscription"
          value={formatMultiple(totalSubscription(ipo.subscriptions))}
          sub={<FreshnessLabel date={ipo.subscriptionLastUpdated} />}
        />
        <KeyMetric
          label="Est. listing price"
          value={stats ? INRFormat(stats.listingPrice) : "—"}
          sub={
            stats ? (
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                {formatSignedINR(stats.gainPerLot)} per lot
              </span>
            ) : undefined
          }
        />
        <KeyMetric label="Listing date" value={dateFormat(ipo.listingDate)} />
      </div>
    </section>
  );
}
