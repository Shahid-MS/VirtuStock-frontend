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
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "@/Store";

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
  showAdminEdit = true,
}: {
  ipo: IPOInterface;
  /** Latest GMP; defaults to the newest entry on the IPO itself. */
  gmp?: GMP | null;
  /** Hide Apply / Mark-as-applied buttons (e.g. on admin screens). */
  showActions?: boolean;
  /** Show an Edit link to the admin edit page (admins only, never on /admin pages). */
  showAdminEdit?: boolean;
}) {
  const isAdmin = useSelector((state: RootState) =>
    state.auth.roles.includes("ROLE_ADMIN")
  );
  const { pathname } = useLocation();
  const canEdit = showAdminEdit && isAdmin && !pathname.startsWith("/admin");
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 lg:text-2xl">
                  {ipo.name}
                </h1>
                {canEdit && (
                  <Link
                    to={`/admin/ipo/${ipo.id}`}
                    title="Edit this IPO (admin)"
                    aria-label="Edit this IPO"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </Link>
                )}
              </div>
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