import { Link } from "react-router";
import { IPOInterface } from "@/Interface/IPO";
import { dateFormat } from "@/Helper/dateHelper";
import { formatPercent } from "@/Helper/financials";
import IpoLogo from "@/components/ipo/IpoLogo";

/** Latest listings with the listing gain or loss. */
export default function RecentlyListedList({ ipos }: { ipos: IPOInterface[] }) {
  return (
    <ul className="space-y-2">
      {ipos.map((ipo) => {
        const gain = Number(ipo.listingReturnPercent);
        const known = Number.isFinite(gain);

        return (
          <li key={ipo.id}>
            <Link
              to={`/ipo/${ipo.id}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
            >
              <IpoLogo name={ipo.name} src={ipo.logo} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                  {ipo.name}
                </p>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Listed {dateFormat(ipo.listingDate)}
                </p>
              </div>
              <span
                className={`shrink-0 text-theme-sm font-semibold tabular-nums ${
                  !known
                    ? "text-gray-400"
                    : gain >= 0
                    ? "text-success-600 dark:text-success-400"
                    : "text-error-600 dark:text-error-400"
                }`}
              >
                {known ? formatPercent(gain) : "—"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
