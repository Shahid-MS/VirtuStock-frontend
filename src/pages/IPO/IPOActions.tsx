import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { RootState } from "@/Store";
import apiClient from "@/API/ApiClient";
import { IPOInterface } from "@/Interface/IPO";
import { useAppliedStatus } from "@/queries/ipoQueries";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

const DEFAULT_APPLY_URL = "https://groww.in/";

export default function IPOActions({ ipo }: { ipo: IPOInterface }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const roles = useSelector((state: RootState) => state.auth.roles);
  const isUser = roles.includes("ROLE_USER");

  const { data: applied } = useAppliedStatus(ipo.id, isUser);
  const isApplied = applied?.applied === true;

  const [lot, setLot] = useState("1");
  const [saving, setSaving] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const isOpenForBidding = (ipo.status ?? "").toUpperCase() === "OPEN";
  const applyUrl = ipo.applicationUrl || DEFAULT_APPLY_URL;

  const handleSave = async () => {
    if (!lot || isNaN(Number(lot)) || Number(lot) < 1) {
      toast.error("Please enter a valid lot number");
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.post(`/user/apply`, {
        ipoId: ipo.id,
        appliedLot: Number(lot),
      });
      queryClient.setQueryData(["applied-status", ipo.id], {
        applied: true,
        appliedIpoId: res.data.appliedIpoId,
      });
      queryClient.invalidateQueries({ queryKey: ["AppliedIpos"] });
      toast.success(res.data.message);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setSaving(false);
      closeModal();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {isOpenForBidding && (
          <div>
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Apply Now
              <span aria-hidden>↗</span>
            </a>
          </div>
        )}

        {isUser && (
          <button
            type="button"
            onClick={
              isApplied && applied?.appliedIpoId
                ? () => navigate(`/user/applied-ipo/${applied.appliedIpoId}`)
                : openModal
            }
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${
              isApplied
                ? "bg-success-50 text-success-700 ring-1 ring-inset ring-success-200 hover:bg-success-100 dark:bg-success-500/15 dark:text-success-400 dark:ring-success-500/30"
                : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            }`}
          >
            {isApplied ? "✓ Applied — view details" : "Mark as Applied"}
          </button>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} showCloseButton={false}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
            <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
              Mark as Applied
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {ipo.name} • lot size {ipo.minQty}
            </p>

            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div>
                <Label>Enter Lot</Label>
                <Input
                  type="text"
                  placeholder="number of lots"
                  value={lot}
                  required
                  onChange={(e) => setLot(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
