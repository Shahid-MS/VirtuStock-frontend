import { GMP, IPOInterface } from "@/Interface/IPO";
import { INRFormat } from "./INRHelper";

/* ---------- numbers ---------- */

export const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export const formatSignedINR = (amount: number): string => {
  if (amount > 0) return `+${INRFormat(amount)}`;
  if (amount < 0) return `-${INRFormat(Math.abs(amount))}`;
  return INRFormat(0);
};

export const formatMultiple = (value: number | null): string =>
  value === null ? "—" : `${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}x`;

/* ---------- GMP ---------- */

const dayValue = (raw?: string): number => {
  const t = new Date(raw ?? "").getTime();
  return Number.isNaN(t) ? -Infinity : t;
};

/** Oldest → newest: by GMP date first, then by when it was last updated. */
export const sortGmpAsc = (gmps?: GMP[] | null): GMP[] =>
  [...(gmps ?? [])].sort((a, b) => {
    const byDate = dayValue(a.gmpDate) - dayValue(b.gmpDate);
    if (byDate !== 0 && !Number.isNaN(byDate)) return byDate;
    const byUpdate = dayValue(a.lastUpdated) - dayValue(b.lastUpdated);
    return Number.isNaN(byUpdate) ? 0 : byUpdate;
  });

/** Latest GMP entry, or null when there is none (never throws). */
export const latestGmp = (gmps?: GMP[] | null): GMP | null => {
  const sorted = sortGmpAsc(gmps);
  return sorted.length ? sorted[sorted.length - 1] : null;
};

export interface GmpStats {
  gmp: number;
  percent: number;
  listingPrice: number;
  gainPerLot: number;
  updatedAt?: string;
}

export const gmpStats = (
  ipo: Pick<IPOInterface, "maxPrice" | "minQty">,
  entry: GMP | null
): GmpStats | null => {
  if (!entry) return null;
  const gmp = toNumber(entry.gmp);
  if (gmp === null) return null;
  const price = toNumber(ipo.maxPrice) ?? 0;
  const qty = toNumber(ipo.minQty) ?? 0;
  return {
    gmp,
    percent: price > 0 ? (gmp / price) * 100 : 0,
    listingPrice: price + gmp,
    gainPerLot: gmp * qty,
    updatedAt: entry.lastUpdated,
  };
};

export const gmpTone = (value: number): string =>
  value > 0
    ? "text-success-600 dark:text-success-400"
    : value < 0
    ? "text-error-600 dark:text-error-400"
    : "text-gray-600 dark:text-gray-300";

/* ---------- investment ---------- */

/** Minimum application amount: upper price band × lot size. */
export const minInvestment = (
  ipo: Pick<IPOInterface, "maxPrice" | "minQty">
): number | null => {
  const price = toNumber(ipo.maxPrice);
  const qty = toNumber(ipo.minQty);
  return price === null || qty === null ? null : price * qty;
};

/* ---------- subscription ---------- */

export interface SubscriptionEntry {
  label: string;
  value: number | null;
}

export const subscriptionEntries = (
  subs?: Record<string, string> | null
): SubscriptionEntry[] =>
  Object.entries(subs ?? {}).map(([label, raw]) => ({
    label,
    value: toNumber(raw),
  }));

export const totalSubscription = (
  subs?: Record<string, string> | null
): number | null => {
  const entry = subscriptionEntries(subs).find((e) =>
    /total|overall/i.test(e.label)
  );
  return entry ? entry.value : null;
};

export const retailSubscription = (
  subs?: Record<string, string> | null
): number | null => {
  const entry = subscriptionEntries(subs).find((e) => /retail/i.test(e.label));
  return entry ? entry.value : null;
};

/* ---------- labels ---------- */

export type BadgeTone =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

const STATUS_META: Record<string, { label: string; color: BadgeTone }> = {
  OPEN: { label: "Open", color: "success" },
  UPCOMING: { label: "Upcoming", color: "info" },
  CLOSED: { label: "Closed", color: "light" },
  ALLOTMENT_PENDING: { label: "Allotment pending", color: "warning" },
  ALLOTMENT: { label: "Allotment", color: "warning" },
  LISTING_PENDING: { label: "Listing pending", color: "warning" },
  LISTED: { label: "Listed", color: "primary" },
};

export const statusMeta = (
  status?: string | null
): { label: string; color: BadgeTone } => {
  const key = (status ?? "").toUpperCase();
  return (
    STATUS_META[key] ?? {
      label: key ? key.replace(/_/g, " ") : "—",
      color: "light",
    }
  );
};

export const ipoTypeLabel = (type?: string | null): string => {
  if (!type) return "";
  return type.toUpperCase() === "EQ" ? "Mainboard" : type;
};

/* ---------- dates ---------- */

/** Parses "YYYY-MM-DD" as a local calendar day (avoids timezone shifts). */
const parseDay = (d?: string | number | Date | null): Date | null => {
  if (d === undefined || d === null || d === "") return null;
  if (typeof d === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const daysFromToday = (d?: string | number | Date | null): number | null => {
  const day = parseDay(d);
  if (!day) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((day.getTime() - today.getTime()) / 86_400_000);
};

const inDays = (verb: string, n: number): string =>
  n === 0
    ? `${verb} today`
    : n === 1
    ? `${verb} tomorrow`
    : `${verb} in ${n} days`;

/** Short, status-aware timing hint ("Closes in 2 days"), or null. */
export const ipoTiming = (
  ipo: Pick<IPOInterface, "status" | "startDate" | "endDate" | "listingDate">
): { label: string; urgent: boolean } | null => {
  const status = (ipo.status ?? "").toUpperCase();

  if (status === "OPEN") {
    const n = daysFromToday(ipo.endDate);
    if (n === null || n < 0) return null;
    return { label: inDays("Closes", n), urgent: n <= 1 };
  }
  if (status === "UPCOMING") {
    const n = daysFromToday(ipo.startDate);
    if (n === null || n < 0) return null;
    return { label: inDays("Opens", n), urgent: false };
  }
  if (status === "ALLOTMENT_PENDING" || status === "LISTING_PENDING") {
    const n = daysFromToday(ipo.listingDate);
    if (n === null || n < 0) return null;
    return { label: inDays("Lists", n), urgent: false };
  }
  return null;
};

/** "just now", "4 min ago", "3 h ago", "2 d ago". Null if date is invalid. */
export const timeAgo = (d?: string | number | Date | null): string | null => {
  if (d === undefined || d === null || d === "") return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  const mins = Math.floor((Date.now() - t) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
};

/** Most recent GMP / subscription update across a list of IPOs. */
export const newestUpdate = (ipos: IPOInterface[]): string | null => {
  let best = -Infinity;
  let bestRaw: string | null = null;
  const consider = (raw?: string) => {
    if (!raw) return;
    const t = new Date(raw).getTime();
    if (!Number.isNaN(t) && t > best) {
      best = t;
      bestRaw = raw;
    }
  };
  ipos.forEach((ipo) => {
    consider(ipo.subscriptionLastUpdated);
    consider(latestGmp(ipo.gmp)?.lastUpdated);
  });
  return bestRaw;
};
