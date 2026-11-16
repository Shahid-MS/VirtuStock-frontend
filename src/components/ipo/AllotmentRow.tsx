import { Link } from "react-router";
import Badge from "@/components/ui/badge/Badge";
import { IPOInterface } from "@/Interface/IPO";
import { dateFormat } from "@/Helper/dateHelper";
import { ALLOTMENT_PHASE_LABEL, allotmentPhase } from "@/Helper/ipoGroups";
import { isWebUrl } from "@/Helper/registrar";
import IpoLogo from "./IpoLogo";
import RegistrarBadge from "./RegistrarBadge";

const day = (date?: string | null) => (date ? dateFormat(date) : "—");

/** One IPO waiting between bidding close and listing, with a quick allotment link. */
export default function AllotmentRow({ ipo }: { ipo: IPOInterface }) {
  const phase = allotmentPhase(ipo);
  const url = ipo.registrar?.url?.trim();

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] sm:p-4">
      <Link
        to={`/ipo/${ipo.id}`}
        className="flex min-w-0 flex-1 basis-60 items-start gap-3"
      >
        <IpoLogo name={ipo.name} src={ipo.logo} className="h-11 w-11" />

        <div className="min-w-0 flex-1">
          <p className="break-words text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {ipo.name}
          </p>
          <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
            Closed {day(ipo.endDate)} · Allotment {day(ipo.allotmentDate)} · Lists{" "}
            {day(ipo.listingDate)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Badge size="sm" color={phase === "done" ? "success" : "warning"}>
              {ALLOTMENT_PHASE_LABEL[phase]}
            </Badge>
            <RegistrarBadge registrar={ipo.registrar} />
          </div>
        </div>
      </Link>

      {isWebUrl(url) ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
        >
          Check allotment
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
          <span className="sr-only">for {ipo.name} (opens in a new tab)</span>
        </a>
      ) : (
        <span className="shrink-0 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-400 dark:bg-white/[0.04] dark:text-gray-500">
          No link yet
        </span>
      )}
    </div>
  );
}
