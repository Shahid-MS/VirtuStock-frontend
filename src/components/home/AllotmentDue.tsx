import { Link } from "react-router";
import { IPOInterface } from "@/Interface/IPO";
import { allotmentHeadline } from "@/Helper/ipoGroups";
import { isWebUrl, registrarShortName } from "@/Helper/registrar";
import IpoLogo from "@/components/ipo/IpoLogo";

/** Horizontal strip of IPOs waiting for allotment, each with a quick check link. */
export default function AllotmentDue({ ipos }: { ipos: IPOInterface[] }) {
  const today = new Date();

  return (
    <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3">
      {ipos.map((ipo) => {
        const url = ipo.registrar?.url?.trim();
        const registrar = registrarShortName(ipo.registrar?.name);

        return (
          <li
            key={ipo.id}
            className="w-64 shrink-0 snap-start rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03] md:w-auto"
          >
            <Link to={`/ipo/${ipo.id}`} className="flex items-center gap-2.5">
              <IpoLogo name={ipo.name} src={ipo.logo} className="h-9 w-9" />
              <span className="min-w-0 truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {ipo.name}
              </span>
            </Link>

            <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
              {allotmentHeadline(ipo, today)}
              {registrar ? ` · ${registrar}` : ""}
            </p>

            {isWebUrl(url) ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex rounded-lg bg-brand-50 px-3 py-1.5 text-theme-xs font-medium text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
              >
                Check allotment ↗
                <span className="sr-only">for {ipo.name} (opens in a new tab)</span>
              </a>
            ) : (
              <Link
                to={`/ipo/${ipo.id}`}
                className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 text-theme-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:bg-transparent dark:text-gray-300 dark:ring-gray-700"
              >
                View details
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
