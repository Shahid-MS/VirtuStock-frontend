interface IPOVerdictProps {
  verdict?: string | null;
  size?: "sm" | "md";
}

const STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  STRONG_BUY: {
    label: "Strong Buy",
    badge:
      "bg-success-50 text-success-700 ring-success-200 dark:bg-success-500/15 dark:text-success-400 dark:ring-success-500/30",
    dot: "bg-success-500",
  },
  BUY: {
    label: "Buy",
    badge:
      "bg-success-50 text-success-700 ring-success-200 dark:bg-success-500/15 dark:text-success-400 dark:ring-success-500/30",
    dot: "bg-success-500",
  },
  WAIT: {
    label: "Wait",
    badge:
      "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-500/15 dark:text-warning-400 dark:ring-warning-500/30",
    dot: "bg-warning-500",
  },
  AVOID: {
    label: "Avoid",
    badge:
      "bg-error-50 text-error-700 ring-error-200 dark:bg-error-500/15 dark:text-error-400 dark:ring-error-500/30",
    dot: "bg-error-500",
  },
  NOT_REVIEWED: {
    label: "Not reviewed",
    badge:
      "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10",
    dot: "bg-gray-400",
  },
};

/** The one place verdicts are styled — use it everywhere. */
export default function IPOVerdict({ verdict, size = "sm" }: IPOVerdictProps) {
  const key = (verdict ?? "NOT_REVIEWED").toUpperCase();
  const style = STYLES[key] ?? {
    ...STYLES.NOT_REVIEWED,
    label: key.replace(/_/g, " "),
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset ${
        size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-theme-xs"
      } ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
