/* eslint-disable @typescript-eslint/no-explicit-any */

import Loading from "@/pages/OtherPage/Loading";
import NotFound from "@/pages/OtherPage/NotFound";
import Pagination from "@/Pagination/Pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  QueryFunctionContext,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "@/API/ApiClient";
import { useEffect, useState } from "react";
import { UserInterface } from "@/Interface/IPO";
import { CheckCircleIcon, ErrorIcon, TrashBinIcon } from "@/icons";
import { confirmDialog } from "primereact/confirmdialog";
import { toast } from "sonner";
import { AxiosError } from "axios";
interface PaginationState {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  lastPage: boolean;
}
export const Users = () => {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({
    pageNumber: 0,
    pageSize: 5,
    totalPages: 0,
    totalElements: 0,
    lastPage: false,
  });
  const fetchUsers = async ({ queryKey }: QueryFunctionContext) => {
    const [, pageNumber, pageSize] = queryKey as [string, number, number];
    const res = await apiClient.get("/admin/user", {
      params: {
        page: pageNumber,
        size: pageSize,
      },
    });
    return res.data;
  };

  const { data, isFetching } = useQuery({
    queryKey: ["users", pagination.pageNumber, pagination.pageSize],
    queryFn: fetchUsers,
    placeholderData: (previousData) => previousData,
    retry: 1,
  });

  useEffect(() => {
    if (!data) return;

    setUsers(data.content ?? []);
    setPagination((prev) => ({
      ...prev,
      totalPages: data.totalPages ?? 0,
      totalElements: data.totalElements ?? 0,
      lastPage: data.lastPage ?? false,
    }));
  }, [data]);

  const setPageNumber = (p: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: p }));
  };

  const handlePromoteAdmin = (
    userId: string,
    name: string,
    isAdmin: boolean
  ) => {
    confirmDialog({
      message: `Are you sure you want to ${
        isAdmin ? "remove admin access from" : "promote as admin"
      } ${name}?`,
      header: "Confirm Action",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes",
      rejectLabel: "No",

      accept: async () => {
        try {
          const res = await apiClient.post(`/admin/user/role`, null, {
            params: {
              userId,
              assignAdmin: !isAdmin,
            },
          });
          toast.success(res.data.message);
          queryClient.invalidateQueries({
            queryKey: ["users"],
          });
        } catch (err) {
          const error = err as AxiosError<any>;
          if (error?.response?.data?.message) {
            toast.error(error.response.data.message || "Failed to fetch");
          }
        }
      },
    });
  };

  const handleDeleteUser = (userId: string, name: string) => {
    confirmDialog({
      message: `Are you sure you want to delete ${name}?`,
      header: "Confirm Action",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes",
      rejectLabel: "No",

      accept: async () => {
        try {
          const res = await apiClient.delete(`/admin/user/${userId}`);
          toast.success(res.data.message);
          if (users.length === 1 && pagination.pageNumber > 0) {
            setPageNumber(pagination.pageNumber - 1);
          } else {
            queryClient.invalidateQueries({
              queryKey: ["users"],
            });
          }
        } catch (err) {
          const error = err as AxiosError<any>;
          if (error?.response?.data?.message) {
            toast.error(error.response.data.message || "Failed to fetch");
          }
        }
      },
    });
  };

  if (isFetching) return <Loading />;

  if (!users.length) return <NotFound />;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                User
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Promote to Admin
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Delete
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {users.map((user) => {
              const isAdmin = user.roles.includes("ROLE_ADMIN") ? true : false;
              return (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <img
                          src={
                            !user.profilePicUrl
                              ? "/images/user/user.png"
                              : user.profilePicUrl
                          }
                          alt={user.firstName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-lg dark:text-gray-400 ">
                    <button
                      onClick={() =>
                        handlePromoteAdmin(user.id, user.firstName, isAdmin)
                      }
                    >
                      {isAdmin ? <CheckCircleIcon /> : <ErrorIcon />}
                    </button>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-lg dark:text-gray-400 ">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.firstName)}
                    >
                      <TrashBinIcon />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Pagination
        pageNumber={pagination.pageNumber}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        totalElements={pagination.totalElements}
        onPageChange={setPageNumber}
      />
    </div>
  );
};

export default Users;
