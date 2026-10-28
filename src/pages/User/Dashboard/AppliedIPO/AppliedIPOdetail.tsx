import apiClient from "@/API/ApiClient";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { AllotmentStatus } from "@/Enum/AllotmentStatus";
import { dateFormat } from "@/Helper/dateHelper";
import { useModal } from "@/hooks/useModal";
import { AppliedIPOInterface } from "@/Interface/IPO";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { confirmDialog } from "primereact/confirmdialog";
import {
  AllotmentPill,
  EditButton,
  LotStepper,
  PanelHeader,
  Spinner,
  Tile,
  money,
} from "./AppliedIPOShared";

interface AppliedIPODetailsInterface {
  appliedIpo: AppliedIPOInterface;
  setAppliedIpo: Dispatch<SetStateAction<AppliedIPOInterface | undefined>>;
}

type UpdateAppliedIpoRequest = {
  lot?: number;
  allotment?: AllotmentStatus;
};

const ALLOTMENT_OPTIONS: { value: AllotmentStatus; label: string }[] = [
  { value: AllotmentStatus.ALLOTED, label: "Allotted" },
  { value: AllotmentStatus.NOT_ALLOTED, label: "Not allotted" },
];

const AppliedIPOdetail = ({
  appliedIpo,
  setAppliedIpo,
}: AppliedIPODetailsInterface) => {
  const [selectedAllotmentStatus, setSelectedAllotmentStatus] =
    useState<AllotmentStatus>(appliedIpo.allotment as AllotmentStatus);

  const { isOpen, openModal, closeModal } = useModal();
  const [lot, setLot] = useState<string>(String(appliedIpo.appliedLot));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const allotmentEditable =
    appliedIpo.allotment !== AllotmentStatus.ALLOTMENT_PENDING;

  // Applied amount at the upper price band (what you'd have to pay).
  const amountFor = (lots: number) =>
    lots * appliedIpo.ipo.minQty * appliedIpo.ipo.maxPrice;

  const lotNumber = Number(lot);
  const lotError =
    lot === "" || !Number.isInteger(lotNumber) || lotNumber < 1
      ? "Enter a valid number of lots (1 or more)"
      : undefined;

  const lotChanged = !lotError && lotNumber !== appliedIpo.appliedLot;
  const allotmentChanged =
    allotmentEditable && selectedAllotmentStatus !== appliedIpo.allotment;
  const canSave = !lotError && (lotChanged || allotmentChanged) && !loading;

  // Always open the editor on the latest saved values.
  const handleOpen = () => {
    setLot(String(appliedIpo.appliedLot));
    setSelectedAllotmentStatus(appliedIpo.allotment as AllotmentStatus);
    openModal();
  };

  const handleSave = async () => {
    if (!canSave) return;

    const req: UpdateAppliedIpoRequest = {};
    if (lotChanged) {
      req.lot = lotNumber;
    }

    if (allotmentChanged) {
      req.allotment = selectedAllotmentStatus;
    }
    setLoading(true);
    try {
      const res = await apiClient.patch(
        `user/applied-ipo/${appliedIpo.id}`,
        req
      );
      toast.success(res.data.message);
      setAppliedIpo((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          appliedLot: lotNumber,
          allotment: selectedAllotmentStatus,
          allotedIpo: res.data.appliedIpo.allotedIpo,
        };
      });
      closeModal();
    } catch (error) {
      // Stay open so the change can be corrected and retried.
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        console.log(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotApplied = async () => {
    closeModal();
    confirmDialog({
      message: `Are you sure you have not applied to ${appliedIpo?.ipo.name}?`,
      header: "Confirm Action",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes",
      rejectLabel: "No",
      accept: async () => {
        try {
          const res = await apiClient.delete(
            `/user/unmark-as-applied?ipoId=${appliedIpo.ipo.id}`
          );
          toast.success(res.data.message);
          navigate(-1);
        } catch (error) {
          console.error("Error unmarking applied status:", error);
        }
      },
      reject: () => {},
    });
  };

  return (
    <div>
      <PanelHeader
        title="Your application"
        subtitle="What you applied for"
        action={<EditButton onClick={handleOpen} />}
      />

      <div className="grid grid-cols-2 gap-3">
        <Tile label="Applied date" value={dateFormat(appliedIpo.appliedDate)} />
        <Tile
          label="Applied lot"
          value={appliedIpo.appliedLot}
          sub={`${appliedIpo.appliedLot * appliedIpo.ipo.minQty} shares`}
        />
        <Tile
          label="Applied amount"
          value={money(amountFor(appliedIpo.appliedLot))}
          sub="at the upper price band"
        />
        <Tile
          label="Allotment"
          value={<AllotmentPill status={appliedIpo.allotment} />}
        />
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} showCloseButton={false}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-900 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Edit applied IPO
            </h3>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              {appliedIpo.ipo.name}
            </p>

            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div>
                <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Lots applied
                </p>
                <LotStepper value={lot} onChange={setLot} error={lotError} />
                {!lotError && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {lotNumber * appliedIpo.ipo.minQty} shares ≈{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {money(amountFor(lotNumber))}
                    </span>{" "}
                    at the upper price band
                  </p>
                )}
              </div>

              {allotmentEditable && (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Allotment result
                  </p>
                  <div
                    role="radiogroup"
                    aria-label="Allotment result"
                    className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5"
                  >
                    {ALLOTMENT_OPTIONS.map((option) => {
                      const active = selectedAllotmentStatus === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSelectedAllotmentStatus(option.value)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-brand-500 motion-reduce:transition-none ${
                            active
                              ? option.value === AllotmentStatus.ALLOTED
                                ? "bg-white text-success-700 shadow-theme-xs dark:bg-gray-800 dark:text-success-400"
                                : "bg-white text-error-700 shadow-theme-xs dark:bg-gray-800 dark:text-error-400"
                              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleNotApplied}
                  className="rounded text-sm font-medium text-error-600 hover:underline focus-visible:outline-2 focus-visible:outline-error-500 dark:text-error-400"
                >
                  I didn't apply
                </button>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={!canSave}>
                    {loading ? (
                      <>
                        <Spinner />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppliedIPOdetail;