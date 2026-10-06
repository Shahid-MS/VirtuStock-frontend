import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { dateandTimeFormat, dateFormat } from "../../Helper/dateHelper";
import { INRFormat } from "../../Helper/INRHelper";
import { IPOProps } from "../../Interface/IPO";

export default function GMPTable({ ipo }: IPOProps) {
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  GMP Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Issue Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  GMP
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Estimated Listing Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Estimated Profit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Last Updated
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {(ipo?.gmp ?? []).length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                  >
                    No GMP history yet.
                  </TableCell>
                </TableRow>
              )}
              {(ipo?.gmp ?? []).map((g, idx) => (
                <TableRow key={g.lastUpdated ?? idx}>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {dateFormat(g.gmpDate)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {INRFormat(ipo?.minPrice)} - {INRFormat(ipo.maxPrice)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {INRFormat(g.gmp)} (
                    {((g.gmp / ipo.maxPrice) * 100).toFixed(2)}%)
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {INRFormat(ipo.maxPrice + g.gmp)}
                  </TableCell>
                  <TableCell className="px-4 py-3  text-center text-gray-500 text-theme-sm dark:text-gray-400">
                    {INRFormat(g.gmp * ipo.minQty)}
                  </TableCell>
                  <TableCell className="px-4 py-3  text-gray-500 text-theme-sm dark:text-gray-400">
                    {dateandTimeFormat(g.lastUpdated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
