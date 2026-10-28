import { useEffect, useState, type ReactNode } from "react";
import { AllotmentStatus } from "@/Enum/AllotmentStatus";
import { INRFormat } from "@/Helper/INRHelper";

/* ---------- formatting ---------- */

export const money = (n?: number | null) =>
  typeof n === "number" && Number.isFinite(n) ? INRFormat(n) : "—";

export const percent = (n?: number | null) =>
  typeof n === "number" && Number.isFinite(n)
    ? `${n > 0 ? "+" : ""}${n.toFixed(2)}%`
    : "—";

/** Green for gains, red for losses, neutral otherwise. */
export const signTone = (n?: number | null) =>
  typeof n !== "number" || n === 0
    ? "text-gray-800 dark:text-white/90"
    : n > 0
    ? "text-success-600 dark:text-success-400"
    : "text-error-600 dark:text-error-400";

/* ---------- allotment status ---------- */

const PILL_STYLES = {
  pending:
    "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-500/15 dark:text-warning-400 dark:ring-warning-500/30",
  allotted:
    "bg-success-50 text-success-700 ring-success-200 dark:bg-success-500/15 dark:text-success-400 dark:ring-success-500/30",
  notAllotted:
    "bg-error-50 text-error-700 ring-error-200 dark:bg-error-500/15 dark:text-error-400 dark:ring-error-500/30",
};

export function AllotmentPill({ status }: { status: string }) {
  const kind =
    status === AllotmentStatus.ALLOTED
      ? "allotted"
      : status === AllotmentStatus.NOT_ALLOTED
      ? "notAllotted"
      : "pending";
  const label =
    kind === "allotted"
      ? "Allotted"
      : kind === "notAllotted"
      ? "Not allotted"
      : "Allotment pending";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${PILL_STYLES[kind]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          kind === "allotted"
            ? "bg-success-500"
            : kind === "notAllotted"
            ? "bg-error-500"
            : "bg-warning-500"
        }`}
      />
      {label}
    </span>
  );
}

/* ---------- building blocks ---------- */

export function Tile({
  label,
  value,
  sub,
  tone,
  className = "",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-theme-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-gray-800 dark:hover:border-brand-500/40 ${className}`}
    >
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <div
        className={`mt-0.5 break-words text-base font-semibold ${
          tone ?? "text-gray-800 dark:text-white/90"
        }`}
      >
        {value}
      </div>
      {sub && (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
      )}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:border-brand-300 hover:bg-brand-25 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.97] motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
    >
      <svg
        className="fill-current"
        width="16"
        height="16"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
        />
      </svg>
      Edit
    </button>
  );
}

/* ---------- form pieces used by the edit windows ---------- */

export const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

/** − [ 3 ] + control for a number of lots. */
export function LotStepper({
  value,
  onChange,
  min = 1,
  max,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  error?: string;
}) {
  const n = Number(value);
  const valid = value !== "" && Number.isInteger(n);
  const base = valid ? n : min;

  const step = (delta: number) => {
    const next = Math.max(min, base + delta);
    onChange(String(max !== undefined ? Math.min(max, next) : next));
  };

  const buttonClass =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-medium text-gray-700 transition hover:border-brand-300 hover:bg-brand-25 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-brand-500/10 dark:disabled:hover:bg-gray-800";

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease lots"
          onClick={() => step(-1)}
          disabled={valid && n <= min}
          className={buttonClass}
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          aria-label="Number of lots"
          aria-invalid={!!error}
          placeholder="number of lots"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          className={`${inputClass} text-center font-medium ${
            error ? "border-error-500 focus:border-error-300" : ""
          }`}
        />
        <button
          type="button"
          aria-label="Increase lots"
          onClick={() => step(1)}
          disabled={max !== undefined && valid && n >= max}
          className={buttonClass}
        >
          +
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-error-500">
          {error}
        </p>
      )}
    </div>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

/* ---------- motion ---------- */

/** Counts 0 → target with an ease-out; jumps straight there for reduced motion. */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}