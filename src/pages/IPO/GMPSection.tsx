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
import GMPTable from "../GMP/GMPTable";

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
    <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
      <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-lg font-semibold sm:text-xl ${valueClass}`}
      >
        {value}
      </p>

      {sub && (
        <p className="mt-1 break-words text-xs text-gray-500 dark:text-gray-400">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function GMPSection({ ipo, history, loading }: GMPSectionProps) {
  if (loading && history.length === 0) {
    return (
      <div className="min-w-0 space-y-5">
        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>

        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const latest = latestGmp(history);
  const stats = gmpStats(ipo, latest);

  if (!stats) {
    return (
      <div className="space-y-4 py-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          GMP hasn't been published for this IPO yet.
        </p>

        {history.length > 0 && <GMPTable ipo={{ ...ipo, gmp: history }} />}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* GMP summary cards */}
      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Current GMP"
          value={formatSignedINR(stats.gmp)}
          sub={`${stats.percent.toFixed(2)}% of issue price`}
          valueClass={gmpTone(stats.gmp)}
        />

        <Stat
          label="Est. listing price"
          value={INRFormat(stats.listingPrice)}
        />

        <Stat
          label="Est. gain per lot"
          value={formatSignedINR(stats.gainPerLot)}
          sub={`${ipo.minQty} shares`}
          valueClass={gmpTone(stats.gainPerLot)}
        />

        <Stat
          label="Issue price (upper band)"
          value={INRFormat(ipo.maxPrice)}
        />
      </div>

      {/* Data freshness */}
      <div className="flex min-w-0 flex-col gap-2 border-b border-gray-100 pb-4 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          GMP trend
        </h3>

        <div className="self-start sm:self-auto">
          <FreshnessLabel date={stats.updatedAt} />
        </div>
      </div>

      {/* GMP chart */}
      <div className="w-full min-w-0">
        <GMPChart history={history} />
      </div>

      {/* GMP history table: stays inside the current GMP tab */}
      <div className="min-w-0 space-y-3">
        <GMPTable ipo={{ ...ipo, gmp: history }} />
      </div>
    </div>
  );
}
