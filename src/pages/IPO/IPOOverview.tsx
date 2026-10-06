import { IPOProps } from "@/Interface/IPO";
import { INRFormat } from "@/Helper/INRHelper";
import { dateFormat } from "@/Helper/dateHelper";
import { minInvestment } from "@/Helper/ipoHelper";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-theme-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800 dark:text-white/90">
        {value}
      </dd>
    </div>
  );
}

const rupees = (v?: string | number | null) =>
  v === undefined || v === null || v === "" ? "—" : `₹ ${v}`;

export default function IPOOverview({ ipo }: IPOProps) {
  const minInvest = minInvestment(ipo);

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
        <Fact
          label="Bidding dates"
          value={`${dateFormat(ipo.startDate)} – ${dateFormat(ipo.endDate)}`}
        />
        <Fact label="Listing date" value={dateFormat(ipo.listingDate)} />
        <Fact
          label="Price band"
          value={`${INRFormat(ipo.minPrice)} – ${INRFormat(ipo.maxPrice)}`}
        />
        <Fact label="Lot size" value={`${ipo.minQty ?? "—"} shares`} />
        <Fact
          label="Minimum investment"
          value={minInvest === null ? "—" : INRFormat(minInvest)}
        />
        <Fact label="Issue size" value={rupees(ipo.issueSize?.totalIssueSize)} />
        <Fact label="Fresh issue" value={rupees(ipo.issueSize?.fresh)} />
        <Fact
          label="Offer for sale"
          value={rupees(ipo.issueSize?.offerForSale)}
        />
      </dl>

      <div>
        <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
          About the company
        </h3>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {ipo.about || "No company description has been added yet."}
        </p>
      </div>
    </div>
  );
}
