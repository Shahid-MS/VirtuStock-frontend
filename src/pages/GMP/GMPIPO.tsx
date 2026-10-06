import NotFound from "../OtherPage/NotFound";
import { useParams } from "react-router";
import GMPHeader from "./GMPHeader";
import GMPTable from "./GMPTable";
import GMPChart from "@/components/ipo/GMPChart";
import { IPOPageSkeleton } from "@/components/ipo/Skeleton";
import { useIpoGmp } from "@/queries/ipoQueries";

export default function GMPIPO() {
  const { id } = useParams();
  const { data: ipo, isLoading, isError } = useIpoGmp(id);

  if (isLoading) return <IPOPageSkeleton />;
  if (isError || !ipo) return <NotFound />;

  return (
    <div className="space-y-6">
      <GMPHeader ipo={ipo} />
      {(ipo.gmp?.length ?? 0) > 1 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
            GMP trend
          </h3>
          <GMPChart history={ipo.gmp} />
        </div>
      )}
      <GMPTable ipo={ipo} />
    </div>
  );
}
