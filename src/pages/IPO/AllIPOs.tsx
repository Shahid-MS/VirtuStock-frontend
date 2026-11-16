import { usePagination } from "@/Pagination/IpoPaginationContext";
import Pagination from "@/Pagination/Pagination";
import IPORow from "@/components/ipo/IPORow";
import { IPORowSkeleton } from "@/components/ipo/Skeleton";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "ALLOTMENT_PENDING", label: "Allotment pending" },
  { value: "LISTING_PENDING", label: "Listing pending" },
  { value: "LISTED", label: "Listed" },
];

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "EQ", label: "Mainboard" },
  { value: "SME", label: "SME" },
];

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="w-14 shrink-0 text-theme-xs text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div role="group" aria-label={`Filter by ${label.toLowerCase()}`} className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value || "all"}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-1.5 text-theme-xs font-medium transition ${
              value === option.value
                ? "border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-400"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.04]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Every IPO in one paginated list, with status and type filters. */
export default function AllIPOs() {
  const { ipos, loading, error, pagination, setPageNumber, filters, setFilters } =
    usePagination();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
            All IPOs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Every IPO, newest first.
          </p>
        </div>
        {pagination.totalElements > 0 && (
          <span className="text-theme-xs text-gray-500 dark:text-gray-400">
            {pagination.totalElements} IPOs
          </span>
        )}
      </div>

      <div className="space-y-3">
        <FilterRow
          label="Status"
          options={STATUS_FILTERS}
          value={filters.status ?? ""}
          onChange={(status) => setFilters({ ...filters, status })}
        />
        <FilterRow
          label="Type"
          options={TYPE_FILTERS}
          value={filters.type ?? ""}
          onChange={(type) => setFilters({ ...filters, type })}
        />
      </div>

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <IPORowSkeleton key={i} />
            ))}
          </div>
        ) : error && ipos.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500 sm:p-8 dark:text-gray-400">
            We couldn't load IPOs right now. Please try again in a moment.
          </p>
        ) : ipos.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500 sm:p-8 dark:text-gray-400">
            No IPOs found for the selected filters.
          </p>
        ) : (
          <div className="min-w-0 divide-y divide-gray-100 dark:divide-gray-800">
            {ipos.map((ipo) => (
              <IPORow key={ipo.id} ipo={ipo} />
            ))}
          </div>
        )}

        <div className="min-w-0 overflow-x-auto">
          <Pagination
            pageNumber={pagination.pageNumber}
            pageSize={pagination.pageSize}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            onPageChange={setPageNumber}
          />
        </div>
      </div>
    </div>
  );
}
