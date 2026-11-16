import { IPOFinancials } from "@/Interface/IPO";

export type Tone = "good" | "bad" | "neutral";

export interface FinancialMetric {
  /** Key as sent by the API, e.g. "Total Income". */
  key: string;
  label: string;
  /** One value per period, oldest first; null when missing. */
  values: (number | null)[];
  /** Metrics where a higher value is bad news (e.g. borrowings). */
  inverse: boolean;
}

export interface FinancialTable {
  /** ISO period-end dates, oldest first. */
  periods: string[];
  /** Display labels for `periods`, e.g. "FY2026". */
  labels: string[];
  metrics: FinancialMetric[];
}

/** Preferred order and friendlier labels; unknown metrics follow as-is. */
const METRIC_LABELS: Record<string, string> = {
  "Total Income": "Total income",
  EBITDA: "EBITDA",
  "Profit After Tax": "Profit after tax",
  Assets: "Assets",
  "NET Worth": "Net worth",
  "Total Borrowing": "Total borrowings",
};

const INVERSE_METRICS = new Set(["Total Borrowing"]);

/** "2026-03-31" -> "FY2026" (Indian financial year); other dates -> "Sep 2026". */
export const periodLabel = (key: string): string => {
  const date = new Date(`${key}T00:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  if (date.getMonth() === 2 && date.getDate() === 31) {
    return `FY${date.getFullYear()}`;
  }
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

export const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Indian digit grouping, up to 2 decimals: 2839.67 -> "2,839.67". */
export const formatAmount = (value: number): string =>
  value.toLocaleString("en-IN", { maximumFractionDigits: 2 });

/** Turns the API's financials into a periods x metrics table, oldest first. */
export const buildFinancialTable = (
  data?: IPOFinancials | null
): FinancialTable => {
  const byPeriod = data?.financials ?? {};
  const periods = Object.keys(byPeriod).sort((a, b) => a.localeCompare(b));

  const seen = new Set<string>();
  periods.forEach((period) =>
    Object.keys(byPeriod[period] ?? {}).forEach((metric) => seen.add(metric))
  );

  const known = Object.keys(METRIC_LABELS).filter((m) => seen.has(m));
  const extra = [...seen].filter((m) => !(m in METRIC_LABELS));

  const metrics = [...known, ...extra].map((key) => ({
    key,
    label: METRIC_LABELS[key] ?? key,
    values: periods.map((period) => toNumber(byPeriod[period]?.[key])),
    inverse: INVERSE_METRICS.has(key),
  }));

  return {
    periods,
    labels: periods.map(periodLabel),
    metrics: periods.length === 0 ? [] : metrics,
  };
};

export interface Change {
  /** Percentage change; null when it can't be computed (previous <= 0). */
  percent: number | null;
  tone: Tone;
}

/** Change from `previous` to `current`; null when either value is missing. */
export const changeBetween = (
  previous: number | null | undefined,
  current: number | null | undefined,
  inverse: boolean
): Change | null => {
  if (
    previous === null ||
    previous === undefined ||
    current === null ||
    current === undefined
  ) {
    return null;
  }

  const diff = current - previous;
  const improved = inverse ? diff < 0 : diff > 0;
  const tone: Tone = diff === 0 ? "neutral" : improved ? "good" : "bad";

  return {
    percent: previous > 0 ? (current / previous - 1) * 100 : null,
    tone,
  };
};

export const formatPercent = (percent: number): string =>
  `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
