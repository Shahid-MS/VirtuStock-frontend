import { IPOInterface } from "@/Interface/IPO";

/** Stages of an IPO's life, in order. Index = position in the timeline. */
export const IPO_STAGES = [
  "Opens",
  "Bidding",
  "Allotment",
  "Demat Transfer/Refund Initiation",
  "Listed",
] as const;

export const ALLOTMENT_STAGE = 2;

/**
 * Index of the stage the IPO is currently in; IPO_STAGES.length means every
 * stage is done (listed). `null` when the status is not recognised.
 */
export const ipoStageIndex = (ipo: IPOInterface): number | null => {
  const status = (ipo.status ?? "").toUpperCase();

  if (status === "LISTED" || Number(ipo.listedPrice) > 0) {
    return IPO_STAGES.length;
  }

  switch (status) {
    case "UPCOMING":
      return 0;
    case "OPEN":
      return 1;
    case "CLOSED":
    case "ALLOTMENT_PENDING":
    case "ALLOTMENT":
      return 2;
    case "LISTING_PENDING":
      return 3;
    default:
      return null;
  }
};

/** True once bidding is over, i.e. the allotment stage has been reached. */
export const hasReachedAllotment = (ipo: IPOInterface): boolean => {
  const stage = ipoStageIndex(ipo);
  return stage !== null && stage >= ALLOTMENT_STAGE;
};
