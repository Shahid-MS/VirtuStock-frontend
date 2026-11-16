import { Link } from "react-router";
import { IPOInterface } from "@/Interface/IPO";
import { formatPercent } from "@/Helper/financials";
import { Stars } from "@/components/ipo/IPORating";
import SectionHeader from "./SectionHeader";

function Row({
  rank,
  ipo,
  children,
}: {
  rank: number;
  ipo: IPOInterface;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        to={`/ipo/${ipo.id}`}
        className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
      >
        <span className="w-4 shrink-0 text-theme-xs text-gray-400">{rank}</span>
        <span className="min-w-0 flex-1 truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
          {ipo.name}
        </span>
        {children}
      </Link>
    </li>
  );
}

/** Top GMP and Top rated, side by side. Either list is hidden when empty. */
export default function TopLists({
  gmp,
  rated,
}: {
  gmp: { ipo: IPOInterface; percent: number }[];
  rated: { ipo: IPOInterface; rating: number }[];
}) {
  if (gmp.length === 0 && rated.length === 0) return null;

  return (
    <div className="grid min-w-0 gap-8 md:grid-cols-2 md:gap-6">
      {gmp.length > 0 && (
        <section className="min-w-0">
          <SectionHeader title="Top GMP today" />
          <ul className="space-y-2">
            {gmp.map(({ ipo, percent }, index) => (
              <Row key={ipo.id} rank={index + 1} ipo={ipo}>
                <span className="shrink-0 text-theme-sm font-semibold tabular-nums text-success-600 dark:text-success-400">
                  {formatPercent(percent)}
                </span>
              </Row>
            ))}
          </ul>
        </section>
      )}

      {rated.length > 0 && (
        <section className="min-w-0">
          <SectionHeader title="Top rated" />
          <ul className="space-y-2">
            {rated.map(({ ipo, rating }, index) => (
              <Row key={ipo.id} rank={index + 1} ipo={ipo}>
                <span className="flex shrink-0 items-center gap-1.5">
                  <Stars value={rating} size={14} />
                  <span className="text-theme-sm font-semibold tabular-nums text-gray-800 dark:text-white/90">
                    {Math.round(rating * 10) / 10}
                  </span>
                </span>
              </Row>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
