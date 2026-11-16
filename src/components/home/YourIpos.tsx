import { Link } from "react-router";

/** Signed-in users: how many IPOs they have applied to, with a link to track them. */
export default function YourIpos({
  count,
  dashboardPath,
}: {
  count: number;
  dashboardPath: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-theme-sm text-gray-700 dark:text-gray-300">
        {count === 0 ? (
          "You haven't applied to any IPO yet. Open an IPO and press Apply to start tracking it."
        ) : (
          <>
            You&apos;ve applied to{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {count} {count === 1 ? "IPO" : "IPOs"}
            </span>
            . Update allotment results from your dashboard.
          </>
        )}
      </p>
      <Link
        to={dashboardPath}
        className="shrink-0 text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
      >
        Dashboard →
      </Link>
    </div>
  );
}
