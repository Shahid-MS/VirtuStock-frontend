import AppliedIPOTable from "./AppliedIPOTable";
import IPOAlloted from "./IPOAlloted";
import MonthlyProfit from "./MonthlyProfit";

export default function UserDashboard() {
  return (
    <div className="space-y-5 md:space-y-6">
      {/* IPO Activity Overview */}
      <section>
        <IPOAlloted />
      </section>

      {/* Portfolio Details */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        <div className="min-w-0">
          <AppliedIPOTable />
        </div>

        <div className="min-w-0">
          <MonthlyProfit />
        </div>
      </div>
    </div>
  );
}