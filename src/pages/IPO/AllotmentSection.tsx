import { IPOInterface } from "@/Interface/IPO";
import { dateFormat } from "@/Helper/dateHelper";
import { statusMeta } from "@/Helper/ipoHelper";
import { hasReachedAllotment } from "@/Helper/ipoStage";
import RegistrarSection from "./RegistrarSection";

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

const day = (date?: string | null) => (date ? dateFormat(date) : "—");

/** Allotment date, listing date and the registrar to check allotment with. */
export default function AllotmentSection({ ipo }: { ipo: IPOInterface }) {
  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
        <Fact label="Allotment date" value={day(ipo.allotmentDate)} />
        <Fact label="Listing date" value={day(ipo.listingDate)} />
        <Fact label="Status" value={statusMeta(ipo.status).label} />
      </dl>

      {/* The status link only makes sense once bidding is over. */}
      <RegistrarSection
        registrar={ipo.registrar}
        showStatusLink={hasReachedAllotment(ipo)}
      />
    </div>
  );
}
