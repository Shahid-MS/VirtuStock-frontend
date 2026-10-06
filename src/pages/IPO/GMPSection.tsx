import { Link } from "react-router";
import FreshnessLabel from "@/components/ipo/FreshnessLabel";
import GMPChart from "@/components/ipo/GMPChart";
import { Skeleton } from "@/components/ipo/Skeleton";
import { GMP, IPOInterface } from "@/Interface/IPO";
import { INRFormat } from "@/Helper/INRHelper";
import {
  formatSignedINR,
  gmpStats,
  gmpTone,
  latestGmp,
} from "@/Helper/ipoHelper";

interface GMPSectionProps {
  ipo: IPOInterface;
  history: GMP[];
  loading: boolean;
}

function Stat({
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
    <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.04]">
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-xl font-semibold ${valueClass}`}>{value}</p>
      {sub && (
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">{sub}</p>
      )}
    </div>
  );
}

export default function GMPSection({ ipo, history, loading }: GMPSectionProps) {
  if (loading && history.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-56" />
      </div>
    );
  }

  const latest = latestGmp(history);
  const stats = gmpStats(ipo, latest);

  if (!stats) {
    return (
      <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        GMP hasn't been published for this IPO yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Current GMP"
          value={formatSignedINR(stats.gmp)}
          sub={`${stats.percent.toFixed(1)}% of issue price`}
          valueClass={gmpTone(stats.gmp)}
        />
        <Stat label="Est. listing price" value={INRFormat(stats.listingPrice)} />
        <Stat
          label="Est. gain per lot"
          value={formatSignedINR(stats.gainPerLot)}
          sub={`${ipo.minQty} shares`}
          valueClass={gmpTone(stats.gainPerLot)}
        />
        <Stat label="Issue price (upper band)" value={INRFormat(ipo.maxPrice)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FreshnessLabel date={stats.updatedAt} />
        <Link
          to={`/ipo/gmp/${ipo.id}`}
          className="text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
        >
          Full GMP history →
        </Link>
      </div>

      <GMPChart history={history} />

      <p className="text-theme-xs text-gray-400 dark:text-gray-500">
        GMP (grey market premium) is an unofficial indicator, not a guarantee of
        listing price.
      </p>
    </div>
  );
}
