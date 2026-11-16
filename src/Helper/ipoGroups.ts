import { IPOInterface } from "@/Interface/IPO";
import { gmpStats, latestGmp, parseDay } from "./ipoHelper";
import { ipoStageIndex } from "./ipoStage";
import { parseRating } from "@/components/ipo/IPORating";

/** Statuses of IPOs that are past bidding but not yet listed. */
export const ALLOTMENT_STATUSES = [
  "CLOSED",
  "ALLOTMENT_PENDING",
  "ALLOTMENT",
  "LISTING_PENDING",
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). */
export const daysBetween = (from: Date, to: Date): number =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

/* ---------- type ---------- */

export const isSme = (ipo: Pick<IPOInterface, "type">): boolean =>
  /sme/i.test(ipo.type ?? "");

/** SME IPOs go to `sme`; everything else (EQ, Mainboard, unknown) to `mainboard`. */
export const splitByType = (ipos: IPOInterface[]) => ({
  mainboard: ipos.filter((ipo) => !isSme(ipo)),
  sme: ipos.filter(isSme),
});

/* ---------- allotment window (closed -> listed) ---------- */

/** Days after the listing date an unlisted IPO is still kept in the window. */
const LISTING_GRACE_DAYS = 7;

export const inAllotmentWindow = (ipo: IPOInterface, today: Date): boolean => {
  const stage = ipoStageIndex(ipo);
  // Stage 2 = closed / allotment, 3 = demat transfer & refund (listing pending).
  if (stage !== 2 && stage !== 3) return false;

  // Old "closed" records that never got a listed price shouldn't linger.
  const listing = parseDay(ipo.listingDate);
  return !(listing && daysBetween(listing, today) > LISTING_GRACE_DAYS);
};

const closeTime = (ipo: IPOInterface) => parseDay(ipo.endDate)?.getTime() ?? 0;

/** IPOs between bidding close and listing, most recently closed first. */
export const allotmentWindow = (
  ipos: IPOInterface[],
  today: Date
): IPOInterface[] =>
  dedupeById(ipos)
    .filter((ipo) => inAllotmentWindow(ipo, today))
    .sort((a, b) => closeTime(b) - closeTime(a));

export type AllotmentPhase = "pending" | "done";

/**
 * "done" once the allotment result is out and listing is the next step. This is
 * about the IPO, not about any one applicant: not everyone who applied gets shares.
 */
export const allotmentPhase = (ipo: IPOInterface): AllotmentPhase =>
  ipoStageIndex(ipo) === 3 ? "done" : "pending";

/** What the Allotment page shows for each phase. */
export const ALLOTMENT_PHASE_LABEL: Record<AllotmentPhase, string> = {
  pending: "Awaiting allotment",
  done: "Allotment done, you can check it",
};

const inDays = (prefix: string, days: number, today: string) =>
  days === 0
    ? `${prefix} today`
    : days === 1
    ? `${prefix} tomorrow`
    : days > 1
    ? `${prefix} in ${days} days`
    : today;

/** Short "what happens next" line, e.g. "Allotment tomorrow", "Lists in 2 days". */
export const allotmentHeadline = (ipo: IPOInterface, today: Date): string => {
  if (ipoStageIndex(ipo) === 3) {
    const listing = parseDay(ipo.listingDate);
    return listing
      ? inDays("Lists", daysBetween(today, listing), "Listing pending")
      : "Listing pending";
  }

  const allotment = parseDay(ipo.allotmentDate);
  return allotment
    ? inDays("Allotment", daysBetween(today, allotment), "Allotment pending")
    : "Allotment pending";
};

/* ---------- lists ---------- */

export const dedupeById = (ipos: IPOInterface[]): IPOInterface[] => {
  const seen = new Set<string>();
  return ipos.filter((ipo) => {
    if (seen.has(ipo.id)) return false;
    seen.add(ipo.id);
    return true;
  });
};

/** Highest positive GMP percentage first. */
export const topByGmp = (ipos: IPOInterface[], count: number) =>
  dedupeById(ipos)
    .map((ipo) => ({ ipo, percent: gmpStats(ipo, latestGmp(ipo.gmp))?.percent }))
    .filter(
      (row): row is { ipo: IPOInterface; percent: number } =>
        row.percent !== undefined && Number.isFinite(row.percent) && row.percent > 0
    )
    .sort((a, b) => b.percent - a.percent)
    .slice(0, count);

/** Highest admin rating first; unrated IPOs are left out. */
export const topRated = (ipos: IPOInterface[], count: number) =>
  dedupeById(ipos)
    .map((ipo) => ({ ipo, rating: parseRating(ipo.rating) }))
    .filter((row): row is { ipo: IPOInterface; rating: number } => row.rating !== null)
    .sort((a, b) => b.rating - a.rating || a.ipo.name.localeCompare(b.ipo.name))
    .slice(0, count);

const listingTime = (ipo: IPOInterface) =>
  parseDay(ipo.listingDate)?.getTime() ?? 0;

/** Listed IPOs, newest listing first. */
export const recentlyListed = (ipos: IPOInterface[], count: number) =>
  dedupeById(ipos)
    .filter((ipo) => Number(ipo.listedPrice) > 0)
    .sort((a, b) => listingTime(b) - listingTime(a))
    .slice(0, count);

/** Average listing gain (%) over the latest `count` listings; null if unknown. */
export const averageListingGain = (
  ipos: IPOInterface[],
  count = 10
): number | null => {
  const gains = recentlyListed(ipos, count)
    .map((ipo) => Number(ipo.listingReturnPercent))
    .filter((gain) => Number.isFinite(gain));

  return gains.length
    ? gains.reduce((sum, gain) => sum + gain, 0) / gains.length
    : null;
};

/* ---------- week calendar ---------- */

export type CalendarEventKind = "open" | "close" | "allotment" | "listing";

export interface CalendarEvent {
  kind: CalendarEventKind;
  ipo: IPOInterface;
}

export interface CalendarDay {
  date: Date;
  key: string;
  isToday: boolean;
  events: CalendarEvent[];
}

/** Monday of the week containing `date`. */
const mondayOf = (date: Date): Date => {
  const day = startOfDay(date);
  const offset = (day.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() - offset);
};

/** Monday to Sunday of the current week, with what happens on each day. */
export const weekCalendar = (
  ipos: IPOInterface[],
  today: Date
): CalendarDay[] => {
  const monday = mondayOf(today);
  const todayKey = dayKey(today);

  const days: CalendarDay[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + index
    );
    return { date, key: dayKey(date), isToday: dayKey(date) === todayKey, events: [] };
  });

  const byKey = new Map(days.map((day) => [day.key, day]));

  const add = (kind: CalendarEventKind, raw: string | null | undefined, ipo: IPOInterface) => {
    const date = parseDay(raw);
    if (!date) return;
    byKey.get(dayKey(date))?.events.push({ kind, ipo });
  };

  dedupeById(ipos).forEach((ipo) => {
    add("open", ipo.startDate, ipo);
    add("close", ipo.endDate, ipo);
    add("allotment", ipo.allotmentDate, ipo);
    add("listing", ipo.listingDate, ipo);
  });

  return days;
};
