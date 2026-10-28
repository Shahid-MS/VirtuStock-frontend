import apiClient from "@/API/ApiClient";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { dateFormat } from "@/Helper/dateHelper";
import { INRFormat } from "@/Helper/INRHelper";
import { useModal } from "@/hooks/useModal";
import { AppliedIPOInterface } from "@/Interface/IPO";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import {
  EditButton,
  LotStepper,
  PanelHeader,
  Spinner,
  Tile,
  inputClass,
  money,
  percent,
  signTone,
  useCountUp,
} from "./AppliedIPOShared";

interface AppliedIPODetailsInterface {
  appliedIpo: AppliedIPOInterface;
  setAppliedIpo: Dispatch<SetStateAction<AppliedIPOInterface | undefined>>;
}
type UpdateAllotedIpoRequest = {
  lot?: number;
  sellPrice?: number | null;
};

/** Headline number: total return, counted up, green or red. */
function TotalReturn({ total, hint }: { total: number; hint: string }) {
  const shown = useCountUp(Math.abs(total));
  const gain = total >= 0;

  return (
    <div
      className={`col-span-2 flex items-center gap-4 rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-theme-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        gain
          ? "border-success-200 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10"
          : "border-error-200 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          gain
            ? "bg-success-500/15 text-success-600 dark:text-success-400"
            : "bg-error-500/15 text-error-600 dark:text-error-400"
        }`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {gain ? <path d="M7 17 17 7M9 7h8v8" /> : <path d="M7 7l10 10M17 9v8H9" />}
        </svg>
      </span>

      <div className="min-w-0">
        <p className="text-xs text-gray-600 dark:text-gray-300">Total return</p>
        <p
          className={`text-2xl font-semibold tabular-nums ${
            gain
              ? "text-success-700 dark:text-success-400"
              : "text-error-700 dark:text-error-400"
          }`}
        >
          {gain ? "+" : "−"}
          {INRFormat(shown)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      </div>
    </div>
  );
}

const AllotmentIPOdetail = ({
  appliedIpo,
  setAppliedIpo,
}: AppliedIPODetailsInterface) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const alloted = appliedIpo.allotedIpo;
  const currentSell: number | null = alloted.sellPrice ?? null;
  const isListed = Date.now() >= new Date(appliedIpo.ipo.listingDate).getTime();

  const [lot, setLot] = useState<string>(String(alloted.allotedLot));
  const [notSold, setNotSold] = useState(currentSell === null);
  const [sellPrice, setSellPrice] = useState<string>(
    currentSell === null ? "" : String(currentSell)
  );

  /* ---- validation (inline, instead of toasts) ---- */
  const lotNumber = Number(lot);
  const lotError =
    lot === "" || !Number.isInteger(lotNumber) || lotNumber < 1
      ? "Enter a valid number of lots (1 or more)"
      : lotNumber > appliedIpo.appliedLot
      ? `Can't be more than the ${appliedIpo.appliedLot} lot(s) you applied for`
      : undefined;

  const sellNumber = Number(sellPrice);
  const sellError =
    isListed && !notSold && (sellPrice === "" || !Number.isFinite(sellNumber) || sellNumber < 0)
      ? "Enter a valid sell price, or switch on \"Not sold yet\""
      : undefined;

  const nextSell: number | null = !isListed
    ? currentSell
    : notSold
    ? null
    : sellNumber;
  const lotChanged = !lotError && lotNumber !== alloted.allotedLot;
  const sellChanged = isListed && !sellError && nextSell !== currentSell;
  const canSave = !lotError && !sellError && (lotChanged || sellChanged) && !loading;

  // Always open the editor on the latest saved values.
  const handleOpen = () => {
    setLot(String(alloted.allotedLot));
    setNotSold(currentSell === null);
    setSellPrice(currentSell === null ? "" : String(currentSell));
    openModal();
  };

  const handleSave = async () => {
    if (!canSave) return;

    const req: UpdateAllotedIpoRequest = {};
    if (lotChanged) {
      req.lot = lotNumber;
    }
    if (sellChanged) {
      req.sellPrice = nextSell;
    }

    setLoading(true);
    try {
      const res = await apiClient.patch(
        `user/alloted-ipo/${alloted.id}`,
        req
      );
      toast.success(res.data.message);
      // The applied lot isn't touched here: only the allotted details changed.
      setAppliedIpo((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          allotedIpo: res.data.alloted,
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

  const totalReturn =
    alloted.netReturn * alloted.allotedLot * appliedIpo.ipo.minQty;

  return (
    <div>
      <PanelHeader
        title="Allotment & returns"
        subtitle="What you got and how it's doing"
        action={<EditButton onClick={handleOpen} />}
      />

      <div className="grid grid-cols-2 gap-3">
        <Tile label="Allotted date" value={dateFormat(alloted.allotedDate)} />
        <Tile
          label="Allotted lot"
          value={alloted.allotedLot}
          sub={`${alloted.allotedLot * appliedIpo.ipo.minQty} shares`}
        />
        <Tile
          label="Price range"
          value={`${INRFormat(appliedIpo.ipo.minPrice)} – ${INRFormat(
            appliedIpo.ipo.maxPrice
          )}`}
          className="col-span-2 sm:col-span-1"
        />

        {isListed && (
          <>
            <Tile
              label="Listed price"
              value={money(appliedIpo.ipo.listedPrice)}
              className="col-span-2 sm:col-span-1"
            />
            <Tile
              label="Listing return"
              value={money(appliedIpo.ipo.listingReturn)}
              sub={percent(appliedIpo.ipo.listingReturnPercent)}
              tone={signTone(appliedIpo.ipo.listingReturn)}
            />
            <Tile
              label="Sell price"
              value={currentSell !== null ? money(currentSell) : "Not sold yet"}
              tone={
                currentSell === null
                  ? "text-gray-500 dark:text-gray-400"
                  : undefined
              }
            />
            <Tile
              label="Return"
              value={money(alloted.netReturn)}
              sub={percent(alloted.netReturnPercent)}
              tone={signTone(alloted.netReturn)}
              className="col-span-2 sm:col-span-1"
            />
            <TotalReturn
              total={totalReturn}
              hint="Return × allotted lots × lot size"
            />
          </>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} showCloseButton={false}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-900 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Edit allotted IPO
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
                  Lots allotted
                </p>
                <LotStepper
                  value={lot}
                  onChange={setLot}
                  max={appliedIpo.appliedLot}
                  error={lotError}
                />
                {!lotError && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {lotNumber * appliedIpo.ipo.minQty} shares · you applied for{" "}
                    {appliedIpo.appliedLot} lot(s)
                  </p>
                )}
              </div>

              {isListed && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-400">
                      Sell price
                    </p>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      Not sold yet
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notSold}
                        onClick={() => setNotSold((v) => !v)}
                        className={`relative h-5 w-9 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 motion-reduce:transition-none ${
                          notSold
                            ? "bg-brand-500"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
                            notSold ? "translate-x-4" : ""
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      ₹
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      aria-label="Sell price"
                      aria-invalid={!!sellError}
                      placeholder={notSold ? "Not sold yet" : "Price per share"}
                      disabled={notSold}
                      value={notSold ? "" : sellPrice}
                      onChange={(e) =>
                        setSellPrice(e.target.value.replace(/[^0-9.]/g, ""))
                      }
                      className={`${inputClass} pl-8 ${
                        sellError ? "border-error-500 focus:border-error-300" : ""
                      }`}
                    />
                  </div>

                  {sellError && (
                    <p role="alert" className="mt-1.5 text-xs text-error-500">
                      {sellError}
                    </p>
                  )}

                  {!notSold &&
                    Number.isFinite(appliedIpo.ipo.listedPrice) &&
                    appliedIpo.ipo.listedPrice > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSellPrice(String(appliedIpo.ipo.listedPrice))
                        }
                        className="mt-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 active:scale-95 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                      >
                        Use listed price ({money(appliedIpo.ipo.listedPrice)})
                      </button>
                    )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
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
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllotmentIPOdetail;