import { Link } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "@/Store";
import { usePagination } from "@/Pagination/IpoPaginationContext";
import Pagination from "@/Pagination/Pagination";
import { useOpenIpos, useUpcomingIpos } from "@/queries/ipoQueries";
import { newestUpdate } from "@/Helper/ipoHelper";
import IPOCard from "@/components/ipo/IPOCard";
import IPORow from "@/components/ipo/IPORow";
import FreshnessLabel from "@/components/ipo/FreshnessLabel";
import { IPOCardSkeleton, IPORowSkeleton } from "@/components/ipo/Skeleton";
import InternalServerError from "../OtherPage/InternalServerError";

const MAX_OPEN_ON_HOME = 6;

function SectionHeader({
  title,
  badge,
  right,
}: {
  title: string;
  badge?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h2>
        {badge && (
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-theme-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            {badge}
          </span>
        )}
      </div>
      {right}
    </div>
  );
}

export const Home = () => {
  const { ipos, loading, error, pagination, setPageNumber } = usePagination();
  const open = useOpenIpos();
  const upcoming = useUpcomingIpos();
  const { isAuthenticated, roles } = useSelector(
    (state: RootState) => state.auth
  );

  if (error && !ipos.length) return <InternalServerError />;

  const openList = open.data ?? [];
  const upcomingList = upcoming.data ?? [];
  const dashboardPath = roles.includes("ROLE_ADMIN") ? "/admin" : "/user";
  const updatedAt = newestUpdate(openList);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="text-theme-xs font-semibold uppercase tracking-widest text-brand-100">
            VirtuStock • IPO simulator for India
          </p>
          <h1 className="mt-2 text-title-sm font-semibold sm:text-title-md">
            Pehle Samjho, Phir Invest Karo
          </h1>
          <p className="mt-3 text-sm text-brand-100 sm:text-base">
            Track GMP, subscription and verdicts for every IPO, and keep a
            record of the ones you apply to.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link
              to="/ipo/open"
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-theme-xs transition hover:bg-brand-25"
            >
              Browse open IPOs
            </Link>
            <Link
              to="/ipo/compare"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 transition hover:bg-white/10"
            >
              Compare IPOs
            </Link>
            <Link
              to={isAuthenticated ? dashboardPath : "/signin"}
              className="px-2 py-2.5 text-sm font-medium text-brand-100 underline-offset-4 hover:text-white hover:underline"
            >
              {isAuthenticated ? "My dashboard →" : "Sign in →"}
            </Link>
          </div>

          {(open.data || upcomingList.length > 0) && (
            <div className="mt-5 flex flex-wrap gap-2 text-theme-xs font-medium">
              {open.data && (
                <span className="rounded-full bg-white/15 px-3 py-1">
                  {openList.length} open now
                </span>
              )}
              {upcomingList.length > 0 && (
                <span className="rounded-full bg-white/15 px-3 py-1">
                  {upcomingList.length} upcoming
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Open IPOs */}
      <section>
        <SectionHeader
          title="Open now"
          badge={open.data ? String(openList.length) : undefined}
          right={
            <div className="flex items-center gap-4">
              <FreshnessLabel date={updatedAt} prefix="Data updated" />
              {openList.length > MAX_OPEN_ON_HOME && (
                <Link
                  to="/ipo/open"
                  className="text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
                >
                  View all {openList.length} →
                </Link>
              )}
            </div>
          }
        />

        {open.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <IPOCardSkeleton />
            <IPOCardSkeleton />
            <IPOCardSkeleton />
          </div>
        ) : open.isError ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We couldn't load open IPOs right now.
            </p>
            <button
              type="button"
              onClick={() => open.refetch()}
              className="mt-3 text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
            >
              Try again
            </button>
          </div>
        ) : openList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No IPOs are open for bidding right now.
            </p>
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              Check upcoming and recent IPOs below.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {openList.slice(0, MAX_OPEN_ON_HOME).map((ipo) => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming IPOs (only when the backend returns some) */}
      {upcomingList.length > 0 && (
        <section>
          <SectionHeader title="Upcoming" badge={String(upcomingList.length)} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcomingList.slice(0, 3).map((ipo) => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        </section>
      )}

      {/* All IPOs */}
      <section>
        <SectionHeader
          title="All IPOs"
          right={
            <Link
              to="/ipo/compare"
              className="text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
            >
              Compare side by side →
            </Link>
          }
        />
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <IPORowSkeleton key={i} />
              ))}
            </div>
          ) : ipos.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No IPOs to show yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {ipos.map((ipo) => (
                <IPORow key={ipo.id} ipo={ipo} />
              ))}
            </div>
          )}
          <Pagination
            pageNumber={pagination.pageNumber}
            pageSize={pagination.pageSize}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            onPageChange={setPageNumber}
          />
        </div>
      </section>
    </div>
  );
};
