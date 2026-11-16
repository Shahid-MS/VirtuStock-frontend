import { useState } from "react";
import { Link } from "react-router";
import { useAllotmentIpos } from "@/queries/ipoQueries";
import { allotmentPhase } from "@/Helper/ipoGroups";
import AllotmentRow from "@/components/ipo/AllotmentRow";
import TypeSections from "@/components/ipo/TypeSections";
import { IPORowSkeleton } from "@/components/ipo/Skeleton";

type Filter = "all" | "pending" | "done";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting allotment" },
  { key: "done", label: "Allotment done" },
];

/** IPOs from bidding close until they list, so allotment can be checked fast. */
export default function AllotmentPage() {
  const { data, isLoading, isError, refetch } = useAllotmentIpos();
  const [filter, setFilter] = useState<Filter>("all");

  const all = data ?? [];
  const counts: Record<Filter, number> = {
    all: all.length,
    pending: all.filter((ipo) => allotmentPhase(ipo) === "pending").length,
    done: all.filter((ipo) => allotmentPhase(ipo) === "done").length,
  };
  const visible =
    filter === "all" ? all : all.filter((ipo) => allotmentPhase(ipo) === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
          Allotment
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          IPOs that have closed and are yet to list. An IPO leaves this page once
          it lists.
        </p>
      </div>

      {isLoading ? (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {Array.from({ length: 4 }).map((_, i) => (
            <IPORowSkeleton key={i} />
          ))}
        </div>
      ) : isError && all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We couldn't load these IPOs right now.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
          >
            Try again
          </button>
        </div>
      ) : all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            No IPOs are waiting for allotment right now.
          </p>
          <Link
            to="/ipo/all"
            className="mt-2 inline-block text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
          >
            Browse all IPOs →
          </Link>
        </div>
      ) : (
        <>
          <div
            role="group"
            aria-label="Filter by stage"
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-full border px-3 py-1.5 text-theme-xs font-medium transition ${
                  filter === key
                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-400"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.04]"
                }`}
              >
                {label} {counts[key]}
              </button>
            ))}
          </div>

          <TypeSections
            ipos={visible}
            emptyMessage={(type) =>
              `No ${type} IPOs are waiting for allotment${
                filter === "all" ? "" : " in this stage"
              }.`
            }
          >
            {(list) => (
              <div className="space-y-3">
                {list.map((ipo) => (
                  <AllotmentRow key={ipo.id} ipo={ipo} />
                ))}
              </div>
            )}
          </TypeSections>
        </>
      )}
    </div>
  );
}
