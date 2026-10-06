import { Link } from "react-router";
import { useOpenIpos } from "@/queries/ipoQueries";
import { newestUpdate } from "@/Helper/ipoHelper";
import IPOCard from "@/components/ipo/IPOCard";
import FreshnessLabel from "@/components/ipo/FreshnessLabel";
import { IPOCardSkeleton } from "@/components/ipo/Skeleton";

export default function OpenIPOs() {
  const { data, isLoading, isError, refetch } = useOpenIpos();
  const ipos = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
            Open IPOs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            IPOs you can currently bid for.
          </p>
        </div>
        <FreshnessLabel date={newestUpdate(ipos)} prefix="Data updated" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <IPOCardSkeleton />
          <IPOCardSkeleton />
          <IPOCardSkeleton />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We couldn't load open IPOs right now.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
          >
            Try again
          </button>
        </div>
      ) : ipos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            No IPOs are open for bidding right now.
          </p>
          <Link
            to="/"
            className="mt-2 inline-block text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
          >
            Browse all IPOs →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ipos.map((ipo) => (
            <IPOCard key={ipo.id} ipo={ipo} />
          ))}
        </div>
      )}
    </div>
  );
}
