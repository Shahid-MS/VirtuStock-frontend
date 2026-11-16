import { useState } from "react";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useAppliedIpos } from "@/queries/userQueries";
import Loading from "../../OtherPage/Loading";
import { IPOStatusColorMap } from "../../../Enum/IPOStatus";
import { IPOAllotmentColorMap } from "../../../Enum/AllotmentStatus";
import { useNavigate } from "react-router";
import Pagination from "../../../Pagination/Pagination";

const PAGE_SIZE = 5;

export default function AppliedIPOTable() {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(0);

  // Errors are already toasted by the shared API client.
  const { data, isLoading } = useAppliedIpos(pageNumber, PAGE_SIZE);

  const appliedIpos = data?.content ?? [];
  const pagination = {
    pageNumber,
    pageSize: PAGE_SIZE,
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
  };

  if (isLoading) return <Loading />;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Applied IPOs
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Company
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Allotment
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          {appliedIpos.length !== 0 && (
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {appliedIpos.map((appliedIpo) => (
                <TableRow key={appliedIpo.id} className="">
                  <TableCell className="py-3">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        navigate(`/user/applied-ipo/${appliedIpo.id}`);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-[40px] w-[40px] overflow-hidden rounded-md">
                          <img
                            src={appliedIpo.ipo.logo}
                            className="h-[40px] w-[40px]"
                            alt={appliedIpo.ipo.name}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {appliedIpo.ipo.name.split(" ")[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        IPOStatusColorMap[appliedIpo.ipo.status] || "light"
                      }
                    >
                      {appliedIpo.ipo.status.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        IPOAllotmentColorMap[appliedIpo.allotment] || "light"
                      }
                    >
                      {appliedIpo.allotment.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>

        <Pagination
          pageNumber={pagination.pageNumber}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          onPageChange={setPageNumber}
        />
      </div>
    </div>
  );
}
