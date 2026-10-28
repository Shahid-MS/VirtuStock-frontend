import { Link } from "react-router";

import Badge from "@/components/ui/badge/Badge";
import IPOVerdict from "@/components/ipo/IPOVerdict";

import { INRFormat } from "../../Helper/INRHelper";
import { dateandTimeFormat } from "../../Helper/dateHelper";
import {
  gmpTone,
  ipoTypeLabel,
  latestGmp,
  statusMeta,
} from "../../Helper/ipoHelper";
import { IPOProps } from "../../Interface/IPO";

export default function GMPHeader({ ipo }: IPOProps) {
  const latest = latestGmp(ipo?.gmp);
  const status = statusMeta(ipo?.status);

  const gmpValue = latest?.gmp ?? null;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-5 lg:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* IPO Information */}
          <div className="flex min-w-0 items-start gap-4">
            <Link
              to={`/ipo/${ipo?.id}`}
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 dark:border-gray-800 lg:h-20 lg:w-20"
            >
              <img
                src={ipo?.logo}
                alt={ipo?.name ?? "IPO logo"}
                className="h-full w-full object-contain"
              />
            </Link>

            <div className="min-w-0">
              <Link
                to={`/ipo/${ipo?.id}`}
                className="text-xl font-semibold text-gray-800 hover:text-brand-500 dark:text-white/90 lg:text-2xl"
              >
                {ipo?.name}
              </Link>

              <p className="mt-1 text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {[ipo?.symbol, ipo?.type ? ipoTypeLabel(ipo.type) : null]
                  .filter(Boolean)
                  .join(" • ")}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {ipo?.verdict && <IPOVerdict verdict={ipo.verdict} size="md" />}

                {ipo?.status && (
                  <Badge size="md" color={status.color}>
                    {status.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Latest GMP */}
          <div className="w-full border-t border-gray-100 pt-4 sm:w-auto sm:shrink-0 sm:border-t-0 sm:pt-0 sm:text-right dark:border-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Latest GMP
            </p>

            <p
              className={`mt-1 text-2xl font-semibold lg:text-3xl ${
                gmpValue !== null
                  ? gmpTone(gmpValue)
                  : "text-gray-800 dark:text-white/90"
              }`}
            >
              {gmpValue !== null ? INRFormat(gmpValue) : "—"}
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {latest?.lastUpdated
                ? `Last updated: ${dateandTimeFormat(latest.lastUpdated)}`
                : "GMP hasn't been published yet"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
