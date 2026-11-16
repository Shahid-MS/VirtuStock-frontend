import { CSSProperties, useMemo, useState } from "react";
import { IPOFinancials } from "@/Interface/IPO";
import {
  Change,
  FinancialMetric,
  Tone,
  buildFinancialTable,
  changeBetween,
  formatAmount,
  formatPercent,
} from "@/Helper/financials";

type ChartType = "bar" | "line";

/* Chart geometry (SVG units; the SVG scales to its container). */
const WIDTH = 360;
const HEIGHT = 190;
const TOP = 28;
const BOTTOM = 150;
const LABEL_Y = 180;

const TEXT_TONE: Record<Tone, string> = {
  good: "text-success-600 dark:text-success-400",
  bad: "text-error-600 dark:text-error-400",
  neutral: "text-gray-500 dark:text-gray-400",
};

const FILL_TONE: Record<Tone, string> = {
  good: "fill-success-500",
  bad: "fill-error-500",
  neutral: "fill-gray-400 dark:fill-gray-500",
};

function Growth({ change }: { change: Change | null }) {
  if (!change || change.percent === null) return null;

  return (
    <span className={`font-medium ${TEXT_TONE[change.tone]}`}>
      {formatPercent(change.percent)}
    </span>
  );
}

/** Tiny trend line for a KPI tile. */
function Sparkline({ values }: { values: (number | null)[] }) {
  const points = values
    .map((value, index) => ({ value, index }))
    .filter((p): p is { value: number; index: number } => p.value !== null);

  if (points.length < 2) return null;

  const nums = points.map((p) => p.value);
  const min = Math.min(...nums);
  const range = Math.max(...nums) - min || 1;
  const step = 54 / Math.max(values.length - 1, 1);

  const coords = points.map((p) => ({
    x: 4 + p.index * step,
    y: 18 - ((p.value - min) / range) * 14,
  }));
  const end = coords[coords.length - 1];

  return (
    <svg width="56" height="22" viewBox="0 0 62 22" aria-hidden="true">
      <polyline
        points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-brand-500"
      />
      <circle cx={end.x} cy={end.y} r="2.6" className="fill-brand-500" />
    </svg>
  );
}

interface ChartProps {
  metric: FinancialMetric;
  labels: string[];
  type: ChartType;
  active: number;
  onActivate: (index: number) => void;
}

function MetricChart({ metric, labels, type, active, onActivate }: ChartProps) {
  const count = labels.length;
  const nums = metric.values.filter((v): v is number => v !== null);
  const low = Math.min(0, ...nums);
  const high = Math.max(0, ...nums);
  const range = high - low || 1;

  const yOf = (value: number) => TOP + ((high - value) / range) * (BOTTOM - TOP);
  const baseline = yOf(0);
  const slot = WIDTH / count;
  const centerX = (index: number) => slot * (index + 0.5);
  const barWidth = Math.min(52, slot * 0.55);

  const toneAt = (index: number): Tone =>
    index === 0
      ? "neutral"
      : changeBetween(
          metric.values[index - 1],
          metric.values[index],
          metric.inverse
        )?.tone ?? "neutral";

  // The line is drawn in segments so a missing year leaves a gap.
  let linePath = "";
  metric.values.forEach((value, index) => {
    if (value === null) return;
    const command = (metric.values[index - 1] ?? null) === null ? "M" : "L";
    linePath += `${command}${centerX(index)},${yOf(value)} `;
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`${metric.label} by financial year`}
      className="mx-auto block h-auto w-full max-w-[380px]"
    >
      {type === "line" && linePath && (
        <path
          d={linePath}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-gray-400/60 dark:stroke-gray-500/60"
        />
      )}

      {metric.values.map((value, index) => {
        const x = centerX(index);
        const isActive = index === active;
        const tone = toneAt(index);

        if (value === null) {
          return (
            <text
              key={labels[index]}
              x={x}
              y={baseline - 10}
              textAnchor="middle"
              className="fill-gray-400 text-xs dark:fill-gray-500"
            >
              —
            </text>
          );
        }

        const y = yOf(value);
        const labelY = value < 0 ? y + 16 : y - 10;

        return (
          <g key={labels[index]}>
            {type === "bar" ? (
              <rect
                x={x - barWidth / 2}
                width={barWidth}
                rx="6"
                className={FILL_TONE[tone]}
                // y/height as CSS properties so the bars animate between metrics.
                style={
                  {
                    y: Math.min(y, baseline),
                    height: Math.max(Math.abs(y - baseline), 3),
                    opacity: isActive ? 1 : 0.45,
                    transition: "y .35s, height .35s, opacity .15s",
                  } as CSSProperties
                }
              />
            ) : (
              <circle
                cx={x}
                cy={y}
                r="6"
                className={FILL_TONE[tone]}
                style={{ opacity: isActive ? 1 : 0.5 }}
              />
            )}

            <text
              x={x}
              y={labelY}
              textAnchor="middle"
              className={`text-xs ${
                isActive
                  ? "fill-gray-800 font-medium dark:fill-white/90"
                  : "fill-gray-500 dark:fill-gray-400"
              }`}
            >
              {formatAmount(value)}
            </text>
          </g>
        );
      })}

      {labels.map((label, index) => (
        <g key={label}>
          <text
            x={centerX(index)}
            y={LABEL_Y}
            textAnchor="middle"
            className={`text-xs ${
              index === active
                ? "fill-gray-800 font-medium dark:fill-white/90"
                : "fill-gray-500 dark:fill-gray-400"
            }`}
          >
            {label}
          </text>
          {/* Whole column is a hover/tap target. */}
          <rect
            x={slot * index}
            y={0}
            width={slot}
            height={HEIGHT}
            className="cursor-pointer fill-transparent"
            onMouseEnter={() => onActivate(index)}
            onClick={() => onActivate(index)}
          />
        </g>
      ))}
    </svg>
  );
}

export default function FinancialsSection({
  data,
}: {
  data?: IPOFinancials | null;
}) {
  const table = useMemo(() => buildFinancialTable(data), [data]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const unit = data?.unit?.trim();

  if (table.metrics.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Financials
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Financial information has not been added yet.
        </p>
      </div>
    );
  }

  const lastIndex = table.periods.length - 1;
  const metric =
    table.metrics.find((m) => m.key === selectedKey) ?? table.metrics[0];
  const active = Math.min(activeIndex ?? lastIndex, lastIndex);

  const activeValue = metric.values[active];
  const activeChange =
    active > 0
      ? changeBetween(metric.values[active - 1], metric.values[active], metric.inverse)
      : null;

  const hasGrowthColumn = table.periods.length > 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Financials
        </h3>
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          {unit ? `All figures in ${unit} · ` : ""}latest {table.labels[lastIndex]}
        </p>
      </div>

      {/* KPI tiles: one per metric, click to chart it */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {table.metrics.map((m) => {
          const latest = m.values[lastIndex];
          const change =
            lastIndex > 0
              ? changeBetween(m.values[lastIndex - 1], latest, m.inverse)
              : null;
          const selected = m.key === metric.key;

          return (
            <button
              key={m.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedKey(m.key)}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                selected
                  ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10"
                  : "border-transparent bg-gray-50 hover:-translate-y-px hover:border-gray-200 dark:bg-white/[0.04] dark:hover:border-gray-700"
              }`}
            >
              <span className="block truncate text-theme-xs text-gray-500 dark:text-gray-400">
                {m.label}
              </span>
              <span className="mt-0.5 block text-base font-semibold tabular-nums text-gray-800 dark:text-white/90">
                {latest === null ? "—" : formatAmount(latest)}
              </span>
              <span className="mt-1 flex items-center justify-between gap-2 text-theme-xs">
                <Growth change={change} />
                <Sparkline values={m.values} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Chart readout + type switch */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite">
            <p className="text-xl font-semibold tabular-nums text-gray-800 dark:text-white/90">
              {activeValue === null ? "—" : formatAmount(activeValue)}
              {unit && activeValue !== null && (
                <span className="ml-1.5 text-sm font-normal text-gray-500 dark:text-gray-400">
                  {unit}
                </span>
              )}
            </p>
            <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
              {table.labels[active]} · {metric.label}
              {activeChange && activeChange.percent !== null && (
                <>
                  {" · "}
                  <Growth change={activeChange} /> vs {table.labels[active - 1]}
                </>
              )}
            </p>
          </div>

          <div
            role="group"
            aria-label="Chart type"
            className="inline-flex overflow-hidden rounded-lg border border-gray-200 text-xs dark:border-gray-700"
          >
            {(["bar", "line"] as const).map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={chartType === type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1.5 transition ${
                  chartType === type
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {type === "bar" ? "Bars" : "Line"}
              </button>
            ))}
          </div>
        </div>

        <MetricChart
          metric={metric}
          labels={table.labels}
          type={chartType}
          active={active}
          onActivate={setActiveIndex}
        />
      </div>

      {/* Full table, oldest year first */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-(--sticky-bg) [--sticky-bg:#ffffff] dark:border-white/[0.05] dark:[--sticky-bg:#171f2e]">
        <table className="w-full min-w-[440px] text-sm">
          <caption className="sr-only">
            Company financials by year{unit ? `, in ${unit}` : ""}
          </caption>
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/[0.05]">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-(--sticky-bg) px-3 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4"
              >
                Metric
              </th>
              {table.labels.map((label, index) => (
                <th
                  key={label}
                  scope="col"
                  className={`whitespace-nowrap px-3 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4 ${
                    index === active ? "bg-gray-50 dark:bg-white/[0.04]" : ""
                  }`}
                >
                  {label}
                </th>
              ))}
              {hasGrowthColumn && (
                <th
                  scope="col"
                  className="whitespace-nowrap px-3 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4"
                >
                  Growth ({table.labels[lastIndex].replace(/^FY20/, "FY")})
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {table.metrics.map((m) => {
              const selected = m.key === metric.key;
              const change = hasGrowthColumn
                ? changeBetween(
                    m.values[lastIndex - 1],
                    m.values[lastIndex],
                    m.inverse
                  )
                : null;

              return (
                <tr
                  key={m.key}
                  tabIndex={0}
                  onClick={() => setSelectedKey(m.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedKey(m.key);
                    }
                  }}
                  className={`cursor-pointer border-b border-gray-100 last:border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 dark:border-white/[0.05] ${
                    selected ? "bg-brand-50 dark:bg-brand-500/10" : ""
                  }`}
                >
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 whitespace-nowrap bg-(--sticky-bg) px-3 py-3 text-start font-medium text-gray-700 dark:text-gray-300 sm:px-4 ${
                      selected
                        ? "after:pointer-events-none after:absolute after:inset-0 after:bg-brand-500/[0.08]"
                        : ""
                    }`}
                  >
                    {m.label}
                  </th>
                  {m.values.map((value, index) => (
                    <td
                      key={table.periods[index]}
                      className={`whitespace-nowrap px-3 py-3 text-end tabular-nums text-gray-800 dark:text-white/90 sm:px-4 ${
                        index === active && !selected
                          ? "bg-gray-50 dark:bg-white/[0.04]"
                          : ""
                      }`}
                    >
                      {value === null ? "—" : formatAmount(value)}
                    </td>
                  ))}
                  {hasGrowthColumn && (
                    <td className="whitespace-nowrap px-3 py-3 text-end tabular-nums sm:px-4">
                      {change && change.percent !== null ? (
                        <Growth change={change} />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
        Click a tile or row to chart it. Hover or tap the chart to inspect a year.
      </p>
    </div>
  );
}
