import { formatPercent } from "@/Helper/financials";

interface Stat {
  label: string;
  value: string;
  tone?: "good" | "bad";
}

/** Four headline numbers under the hero. Missing numbers show "—". */
export default function HomeStats({
  open,
  upcoming,
  awaiting,
  averageGain,
}: {
  open?: number;
  upcoming?: number;
  awaiting?: number;
  averageGain: number | null;
}) {
  const stats: Stat[] = [
    { label: "Open now", value: open === undefined ? "—" : String(open) },
    { label: "Upcoming", value: upcoming === undefined ? "—" : String(upcoming) },
    {
      label: "Closed, yet to list",
      value: awaiting === undefined ? "—" : String(awaiting),
    },
    {
      label: "Avg listing gain (last 10)",
      value: averageGain === null ? "—" : formatPercent(averageGain),
      tone: averageGain === null ? undefined : averageGain >= 0 ? "good" : "bad",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="min-w-0 rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.04]"
        >
          <dt className="truncate text-theme-xs text-gray-500 dark:text-gray-400">
            {stat.label}
          </dt>
          <dd
            className={`mt-0.5 text-xl font-semibold tabular-nums ${
              stat.tone === "good"
                ? "text-success-600 dark:text-success-400"
                : stat.tone === "bad"
                ? "text-error-600 dark:text-error-400"
                : "text-gray-800 dark:text-white/90"
            }`}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
