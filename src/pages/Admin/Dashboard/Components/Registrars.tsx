import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Pagination from "@/Pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon } from "@/icons";
import { Registrar } from "@/Interface/IPO";
import { updateRegistrarLogo } from "@/API/registrarApi";
import { getApiErrorMessage } from "@/API/errors";
import { useAdminRegistrars } from "@/queries/adminQueries";
import { queryKeys } from "@/queries/queryKeys";
import { RegistrarLogo } from "@/pages/IPO/RegistrarSection";
import EditRegistrarLogoModal from "./EditRegistrarLogoModal";

const PAGE_SIZE = 5;

const HEADER_CLASS =
  "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400";

function LogoBadge({ hasLogo }: { hasLogo: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-theme-xs font-medium ${
        hasLogo
          ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400"
          : "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400"
      }`}
    >
      {hasLogo ? "Added" : "Missing"}
    </span>
  );
}

export const Registrars = () => {
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(0);
  const [editing, setEditing] = useState<Registrar | null>(null);

  const { data, isLoading, isError, error, refetch } = useAdminRegistrars(
    pageNumber,
    PAGE_SIZE
  );

  const registrars = data?.content ?? [];

  const handleSubmit = async (registrar: Registrar, file: File) => {
    if (registrar.id === undefined) return;

    const res = await updateRegistrarLogo(registrar.id, file);
    toast.success(res.message ?? "Logo updated");

    // Only this table and the IPO pages that embed the registrar need a refresh.
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.registrarsAll });
    queryClient.invalidateQueries({ queryKey: queryKeys.ipo.allDetails });
    setEditing(null);
  };

  return (
    <section>
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Registrars
        </h3>
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          Click the pencil to change a registrar&apos;s logo.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {isLoading ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading registrars…
          </p>
        ) : isError && !data ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              Couldn&apos;t load registrars
            </p>
            <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
              {getApiErrorMessage(error) ?? "Something went wrong."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]"
            >
              Try again
            </button>
          </div>
        ) : registrars.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No registrars found.
          </p>
        ) : (
          <>
            {/* Phones: one card per registrar */}
            <ul className="divide-y divide-gray-100 dark:divide-white/[0.05] md:hidden">
              {registrars.map((registrar) => {
                const name = registrar.name?.trim() || "Unnamed registrar";

                return (
                  <li
                    key={registrar.id ?? name}
                    className="flex items-start gap-2 px-4 py-3"
                  >
                    <button
                      type="button"
                      onClick={() => setEditing(registrar)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-start"
                    >
                      <RegistrarLogo name={name} logo={registrar.logo} />
                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {name}
                        </span>
                        {registrar.slug && (
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {registrar.slug}
                          </span>
                        )}
                        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <LogoBadge hasLogo={!!registrar.logo} />
                        </span>
                        {registrar.url && (
                          <span className="mt-1 block truncate text-gray-500 text-theme-xs dark:text-gray-400">
                            {registrar.url}
                          </span>
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditing(registrar)}
                      aria-label={`Edit logo of ${name}`}
                      title="Edit logo"
                      className="shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-brand-400"
                    >
                      <PencilIcon />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Larger screens: the table */}
            <div className="hidden max-w-full overflow-x-auto md:block">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className={HEADER_CLASS}>
                      Registrar
                    </TableCell>
                    <TableCell isHeader className={HEADER_CLASS}>
                      Allotment status URL
                    </TableCell>
                    <TableCell isHeader className={HEADER_CLASS}>
                      Logo
                    </TableCell>
                    <TableCell isHeader className={HEADER_CLASS}>
                      Edit
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {registrars.map((registrar) => {
                    const name = registrar.name?.trim() || "Unnamed registrar";

                    return (
                      <TableRow key={registrar.id ?? name}>
                        <TableCell className="px-5 py-4 text-start sm:px-6">
                          <button
                            type="button"
                            onClick={() => setEditing(registrar)}
                            className="flex items-center gap-3 text-start"
                          >
                            <RegistrarLogo name={name} logo={registrar.logo} />
                            <span>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {name}
                              </span>
                              {registrar.slug && (
                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                  {registrar.slug}
                                </span>
                              )}
                            </span>
                          </button>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <span
                            title={registrar.url ?? undefined}
                            className="block max-w-[260px] truncate text-gray-500 text-theme-xs dark:text-gray-400"
                          >
                            {registrar.url || "—"}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <LogoBadge hasLogo={!!registrar.logo} />
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-500 text-theme-lg dark:text-gray-400">
                          <button
                            type="button"
                            onClick={() => setEditing(registrar)}
                            aria-label={`Edit logo of ${name}`}
                            title="Edit logo"
                            className="rounded-lg p-2 transition-colors hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-white/[0.06] dark:hover:text-brand-400"
                          >
                            <PencilIcon />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <Pagination
              pageNumber={pageNumber}
              pageSize={PAGE_SIZE}
              totalPages={data?.totalPages ?? 0}
              totalElements={data?.totalElements ?? 0}
              onPageChange={setPageNumber}
            />
          </>
        )}
      </div>

      <EditRegistrarLogoModal
        registrar={editing}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default Registrars;
