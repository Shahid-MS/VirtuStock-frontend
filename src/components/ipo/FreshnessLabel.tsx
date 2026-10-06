import { dateandTimeFormat } from "@/Helper/dateHelper";
import { timeAgo } from "@/Helper/ipoHelper";

interface FreshnessLabelProps {
  date?: string | null;
  prefix?: string;
}

/** "● Updated 4 min ago" — green when fresh, amber when stale, grey when old. */
export default function FreshnessLabel({
  date,
  prefix = "Updated",
}: FreshnessLabelProps) {
  const ago = timeAgo(date);
  if (!ago) return null;

  const hours = (Date.now() - new Date(date as string).getTime()) / 3_600_000;
  const dot =
    hours < 3 ? "bg-success-500" : hours < 24 ? "bg-warning-500" : "bg-gray-400";

  return (
    <span
      className="inline-flex items-center gap-1.5 text-theme-xs text-gray-500 dark:text-gray-400"
      title={dateandTimeFormat(date)}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {prefix} {ago}
    </span>
  );
}
