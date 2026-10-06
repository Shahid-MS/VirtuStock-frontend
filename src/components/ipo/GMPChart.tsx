import { GMP } from "@/Interface/IPO";
import { INRFormat } from "@/Helper/INRHelper";
import { dateFormat } from "@/Helper/dateHelper";
import { sortGmpAsc, toNumber } from "@/Helper/ipoHelper";

const W = 480;
const H = 220;
const PAD = { top: 14, right: 14, bottom: 30, left: 52 };

/** Dependency-free SVG line chart of GMP over time. */
export default function GMPChart({ history }: { history: GMP[] }) {
  const points = sortGmpAsc(history)
    .map((g) => ({ value: toNumber(g.gmp), date: g.gmpDate ?? g.lastUpdated }))
    .filter((p): p is { value: number; date: string } => p.value !== null)
    .slice(-30);

  if (points.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Not enough GMP history to draw a chart yet.
      </p>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(0, ...values);
  let max = Math.max(0, ...values);
  if (min === max) max = min + 1;
  const range = max - min;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
  const y = (v: number) => PAD.top + (1 - (v - min) / range) * innerH;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(" ");
  const baseline = y(Math.max(min, 0)).toFixed(1);
  const area = `${line} L${x(points.length - 1).toFixed(1)},${baseline} L${x(0).toFixed(1)},${baseline} Z`;

  const ticks = [min, min + range / 2, max];
  const last = points[points.length - 1];
  const first = points[0];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full text-brand-500"
      role="img"
      aria-label={`GMP trend from ${INRFormat(first.value)} to ${INRFormat(last.value)}`}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            className="stroke-gray-200 dark:stroke-gray-800"
            strokeDasharray="3 4"
          />
          <text
            x={PAD.left - 8}
            y={y(t) + 4}
            textAnchor="end"
            className="fill-gray-400 text-[11px]"
          >
            {INRFormat(Math.round(t))}
          </text>
        </g>
      ))}

      <path d={area} className="fill-current opacity-10" />
      <path
        d={line}
        fill="none"
        className="stroke-current"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map((p, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(p.value)}
          r={i === points.length - 1 ? 4.5 : 2.5}
          className="fill-current stroke-white dark:stroke-gray-900"
          strokeWidth={1.5}
        >
          <title>{`${dateFormat(p.date)}: ${INRFormat(p.value)}`}</title>
        </circle>
      ))}

      <text
        x={PAD.left}
        y={H - 8}
        textAnchor="start"
        className="fill-gray-400 text-[11px]"
      >
        {dateFormat(first.date)}
      </text>
      <text
        x={W - PAD.right}
        y={H - 8}
        textAnchor="end"
        className="fill-gray-400 text-[11px]"
      >
        {dateFormat(last.date)}
      </text>
    </svg>
  );
}
