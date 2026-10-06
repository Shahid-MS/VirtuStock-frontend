import { Link } from "react-router";
import Badge from "@/components/ui/badge/Badge";
import { IPOInterface } from "@/Interface/IPO";
import { dateFormat } from "@/Helper/dateHelper";
import {
  formatSignedINR,
  gmpTone,
  ipoTypeLabel,
  latestGmp,
  statusMeta,
  toNumber,
} from "@/Helper/ipoHelper";
import IPOVerdict from "./IPOVerdict";

/** Compact one-line IPO entry for directory-style lists. */
export default function IPORow({ ipo }: { ipo: IPOInterface }) {
  const status = statusMeta(ipo.status);
  const gmp = toNumber(latestGmp(ipo.gmp)?.gmp);

  return (
    <Link
      to={`/ipo/${ipo.id}`}
      className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-gray-50 dark:hover:bg-white/[0.03] sm:px-5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white p-0.5 dark:border-gray-800">
        <img
          src={ipo.logo}
          alt={ipo.name}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
          {ipo.name}
        </p>
        <p className="truncate text-theme-xs text-gray-500 dark:text-gray-400">
          {ipoTypeLabel(ipo.type)}
          {ipoTypeLabel(ipo.type) ? " • " : ""}
          {dateFormat(ipo.startDate)} – {dateFormat(ipo.endDate)}
        </p>
      </div>

      <div className="hidden w-24 text-right sm:block">
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">GMP</p>
        <p
          className={`text-theme-sm font-semibold ${
            gmp === null ? "text-gray-400" : gmpTone(gmp)
          }`}
        >
          {gmp === null ? "—" : formatSignedINR(gmp)}
        </p>
      </div>

      <div className="hidden md:block">
        <IPOVerdict verdict={ipo.verdict} />
      </div>

      <div className="w-24 text-right">
        <Badge size="sm" color={status.color}>
          {status.label}
        </Badge>
      </div>
    </Link>
  );
}
