import { useEffect, useState } from "react";
import { useParams } from "react-router";

import IPOHeader from "./IPOHeader";
import IPOOverview from "./IPOOverview";
import GMPSection from "./GMPSection";
import StrengthRisks from "./StrengthRisks";
import NotFound from "../OtherPage/NotFound";

import SubscriptionBars from "@/components/ipo/SubscriptionBars";
import FreshnessLabel from "@/components/ipo/FreshnessLabel";
import { IPOPageSkeleton } from "@/components/ipo/Skeleton";

import { useIpoDetail, useIpoGmp } from "@/queries/ipoQueries";
import { latestGmp } from "@/Helper/ipoHelper";
import { INRFormat } from "@/Helper/INRHelper";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "gmp", label: "GMP" },
  { key: "subscription", label: "Subscription" },
  { key: "risks", label: "Strengths & Risks" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function IPO() {
  const { id } = useParams();
  const [tab, setTab] = useState<TabKey>("overview");

  const { data: ipo, isLoading, isError } = useIpoDetail(id);

  // The detail response normally carries the latest GMP.
  // Only call the extra GMP endpoint when the GMP tab is opened
  // or when the detail response has no GMP.
  const detailGmp = latestGmp(ipo?.gmp);

  const gmpQuery = useIpoGmp(
    id,
    !!ipo && (tab === "gmp" || !detailGmp)
  );

  useEffect(() => {
    setTab("overview");
  }, [id]);

  if (isLoading) {
    return <IPOPageSkeleton />;
  }

  if (isError || !ipo) {
    return <NotFound />;
  }

  const history = gmpQuery.data?.gmp?.length
    ? gmpQuery.data.gmp
    : ipo.gmp ?? [];

  const currentGmp = latestGmp(history);

  /*
   * ---------------------------------------------------------
   * LISTING PERFORMANCE
   * ---------------------------------------------------------
   *
   * Backend already provides:
   *
   * listingReturn
   * listingReturnPercent
   *
   * Example:
   * maxPrice   = 112
   * listedPrice = 120
   *
   * listingReturn = 8
   * listingReturnPercent = 7.14
   *
   * Profit/Loss per lot is calculated here using:
   *
   * listingReturn × minQty
   */

  const isListed = ipo.status?.toUpperCase() === "LISTED" || ipo.status?.toUpperCase() === "CLOSED";

  const listingReturn = Number(ipo.listingReturn ?? 0);
  const listingReturnPercent = Number(
    ipo.listingReturnPercent ?? 0
  );

  const minQty = Number(ipo.minQty ?? 0);

  const listingProfitLossPerLot = listingReturn * minQty;

  const listingTone =
    listingReturn > 0
      ? "text-success-600 dark:text-success-400"
      : listingReturn < 0
      ? "text-error-600 dark:text-error-400"
      : "text-gray-600 dark:text-gray-300";

  return (
    <div className="space-y-6">
      <IPOHeader ipo={ipo} gmp={currentGmp} />

      {/* -----------------------------------------------------
          LISTING PERFORMANCE
          Only shown after IPO is listed
      ------------------------------------------------------ */}

      {isListed && ipo.listedPrice != null && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Listing Performance
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Performance based on the IPO issue price and actual listing price.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {/* Issue Price */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Issue Price
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
                {INRFormat(Number(ipo.maxPrice ?? 0))}
              </p>
            </div>

            {/* Listed Price */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Listed Price
              </p>

              <p className={`mt-1 text-lg font-semibold ${listingTone}`}>
                {INRFormat(Number(ipo.listedPrice))}
              </p>
            </div>

            {/* Listing Gain / Loss */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Listing Gain/Loss
              </p>

              <p className={`mt-1 text-lg font-semibold ${listingTone}`}>
                {listingReturn > 0 ? "+" : ""}
                {INRFormat(listingReturn)}

                <span className="ml-1 text-sm font-medium">
                  ({listingReturnPercent > 0 ? "+" : ""}
                  {listingReturnPercent.toFixed(2)}%)
                </span>
              </p>
            </div>

            {/* Profit / Loss per Lot */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Profit/Loss per Lot
              </p>

              <p className={`mt-1 text-lg font-semibold ${listingTone}`}>
                {listingProfitLossPerLot > 0 ? "+" : ""}
                {INRFormat(listingProfitLossPerLot)}
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {minQty.toLocaleString("en-IN")} shares
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------
          TABS
      ------------------------------------------------------ */}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div
          role="tablist"
          aria-label="IPO sections"
          className="no-scrollbar flex gap-1 overflow-x-auto border-b border-gray-100 px-3 dark:border-gray-800 sm:px-5"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-3.5 text-sm font-medium transition ${
                tab === t.key
                  ? "border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="p-5 lg:p-6">
          {/* Overview */}
          {tab === "overview" && <IPOOverview ipo={ipo} />}

          {/* GMP */}
          {tab === "gmp" && (
            <GMPSection
              ipo={ipo}
              history={history}
              loading={gmpQuery.isLoading}
            />
          )}

          {/* Subscription */}
          {tab === "subscription" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Subscription status
                </h3>

                <FreshnessLabel
                  date={ipo.subscriptionLastUpdated}
                />
              </div>

              <SubscriptionBars
                subscription={ipo.subscriptions}
              />
            </div>
          )}

          {/* Strengths & Risks */}
          {tab === "risks" && <StrengthRisks ipo={ipo} />}
        </div>
      </div>
    </div>
  );
}