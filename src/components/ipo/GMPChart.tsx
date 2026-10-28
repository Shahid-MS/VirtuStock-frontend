
import { useMemo, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { GMP } from "@/Interface/IPO";
import { INRFormat } from "@/Helper/INRHelper";
import { dateFormat } from "@/Helper/dateHelper";
import { sortGmpAsc, toNumber } from "@/Helper/ipoHelper";

interface GMPChartProps {
  history: GMP[];
}

const W = 480;
const H = 260;

const PAD = {
  top: 24,
  right: 18,
  bottom: 42,
  left: 58,
};

const TOOLTIP_WIDTH = 130;
const TOOLTIP_HEIGHT = 43;
const TOOLTIP_GAP = 12;

const POSITIVE_COLOR = "#22c55e";
const NEGATIVE_COLOR = "#ef4444";
const ZERO_COLOR = "#9ca3af";

function getValueColor(value: number): string {
  if (value > 0) return POSITIVE_COLOR;
  if (value < 0) return NEGATIVE_COLOR;
  return ZERO_COLOR;
}

function formatTooltipDate(value?: string | null): string {
  if (!value) return "Date unavailable";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value.split("T")[0];
  }

  return parsed.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export default function GMPChart({ history }: GMPChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pointerX, setPointerX] = useState<number | null>(null);

  const points = useMemo(() => {
    return sortGmpAsc(history ?? [])
      .map((item) => ({
        value: toNumber(item.gmp),
        date: item.gmpDate ?? item.lastUpdated,
      }))
      .filter(
        (item) => Number.isFinite(item.value) && Boolean(item.date)
      )
      .slice(-30);
  }, [history]);

  const chartWidth = W - PAD.left - PAD.right;
  const chartHeight = H - PAD.top - PAD.bottom;

  const values = points.map((point) => point.value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);

  // Add padding only on the side where GMP values extend.
  const valuePadding =
    maxValue === minValue
      ? Math.max(Math.abs(maxValue) * 0.2, 10)
      : (maxValue - minValue) * 0.15;

  const yMin = minValue < 0 ? minValue - valuePadding : 0;
  const yMax = maxValue > 0 ? maxValue + valuePadding : 0;
  const yRange = yMax - yMin || 1;

  const getX = (index: number) =>
    points.length <= 1
      ? PAD.left + chartWidth / 2
      : PAD.left + (index / (points.length - 1)) * chartWidth;

  const getY = (value: number) =>
    PAD.top + ((yMax - value) / yRange) * chartHeight;

  const plottedPoints = points.map((point, index) => ({
    ...point,
    x: getX(index),
    y: getY(point.value),
  }));

  const lineSegments = useMemo(() => {
    const segments: {
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
    }[] = [];

    for (let i = 0; i < plottedPoints.length - 1; i++) {
      const p1 = plottedPoints[i];
      const p2 = plottedPoints[i + 1];

      if (p1.value === 0 && p2.value === 0) {
        segments.push({
          key: `segment-${i}-zero`,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          color: ZERO_COLOR,
        });
        continue;
      }

      if (
        p1.value !== 0 &&
        p2.value !== 0 &&
        Math.sign(p1.value) !== Math.sign(p2.value)
      ) {
        const ratio =
          Math.abs(p1.value) /
          (Math.abs(p1.value) + Math.abs(p2.value));

        const zeroX = p1.x + (p2.x - p1.x) * ratio;
        const zeroY = getY(0);

        segments.push({
          key: `segment-${i}-first`,
          x1: p1.x,
          y1: p1.y,
          x2: zeroX,
          y2: zeroY,
          color: getValueColor(p1.value),
        });

        segments.push({
          key: `segment-${i}-second`,
          x1: zeroX,
          y1: zeroY,
          x2: p2.x,
          y2: p2.y,
          color: getValueColor(p2.value),
        });

        continue;
      }

      segments.push({
        key: `segment-${i}`,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        color:
          p1.value === 0
            ? getValueColor(p2.value)
            : getValueColor(p1.value),
      });
    }

    return segments;
  }, [plottedPoints, yMin, yMax]);

  const firstPoint = plottedPoints[0];
  const lastPoint = plottedPoints[plottedPoints.length - 1];

  const selectedPoint =
    activeIndex !== null ? plottedPoints[activeIndex] : null;

  const tooltipPoint = selectedPoint ?? lastPoint;
  const activeColor = getValueColor(tooltipPoint?.value ?? 0);

  /*
   * Generate axis labels:
   * - Positive-only: zero at the bottom.
   * - Negative-only: zero at the top.
   * - Mixed: positive labels above and negative labels below zero.
   *
   * Include zero once and avoid duplicate rounded labels.
   */
  const yTicks = useMemo(() => {
    const rawTicks: number[] = [];

    for (let i = 0; i <= 4; i++) {
      rawTicks.push(yMax - (yRange * i) / 4);
    }

    // Ensure zero is represented at its exact mathematical position.
    rawTicks.push(0);

    const sorted = rawTicks
      .map((tick) => (Math.abs(tick) < 1e-8 ? 0 : tick))
      .sort((a, b) => b - a);

    const seen = new Set<string>();

    return sorted.filter((tick) => {
      const label =
        tick === 0 ? "0" : String(Math.round(tick));

      if (seen.has(label)) return false;

      seen.add(label);
      return true;
    });
  }, [yMin, yMax, yRange]);

  function handlePointerMove(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    if (points.length === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;

    const svgX = ((event.clientX - rect.left) / rect.width) * W;

    const clampedX = clamp(svgX, PAD.left, W - PAD.right);
    setPointerX(clampedX);

    const ratio = (clampedX - PAD.left) / chartWidth;

    const index =
      points.length <= 1
        ? 0
        : Math.round(ratio * (points.length - 1));

    setActiveIndex(clamp(index, 0, points.length - 1));
  }

  function handlePointerDown(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    handlePointerMove(event);
  }

  function handlePointerLeave(
    event: ReactPointerEvent<SVGSVGElement>
  ) {
    if (event.pointerType !== "touch") {
      setActiveIndex(null);
      setPointerX(null);
    }
  }

  if (points.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        No GMP history available
      </div>
    );
  }

  const tooltipX = clamp(
    tooltipPoint.x,
    PAD.left + TOOLTIP_WIDTH / 2 + 4,
    W - PAD.right - TOOLTIP_WIDTH / 2 - 4
  );

  const tooltipY = (() => {
    const minY = PAD.top + 2;
    const maxY = H - PAD.bottom - TOOLTIP_HEIGHT - 2;

    const aboveY = tooltipPoint.y - TOOLTIP_HEIGHT - TOOLTIP_GAP;
    const belowY = tooltipPoint.y + TOOLTIP_GAP;

    if (aboveY >= minY) return aboveY;
    if (belowY <= maxY) return belowY;

    return clamp(aboveY, minY, maxY);
  })();

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="relative w-full min-w-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full overflow-visible"
          role="img"
          aria-label="GMP history chart. Move across the chart to inspect GMP values by date."
          style={{
            touchAction: "pan-y",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            <linearGradient
              id="gmpAreaGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={activeColor}
                stopOpacity="0.20"
              />
              <stop
                offset="100%"
                stopColor={activeColor}
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines and labels */}
          {yTicks.map((tick, index) => {
            const isZero = tick === 0;
            const y = getY(tick);

            return (
              <g key={`grid-${index}`}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={W - PAD.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={isZero ? 0.4 : 0.12}
                  strokeWidth={isZero ? 1.5 : 1}
                  strokeDasharray={isZero ? undefined : "4 4"}
                />

                <text
                  x={PAD.left - 9}
                  y={y + 4}
                  textAnchor="end"
                  fill="currentColor"
                  fillOpacity={isZero ? 1 : 0.65}
                  fontSize="10"
                  fontWeight={isZero ? "700" : "400"}
                >
                  {isZero ? "0" : Math.round(tick)}
                </text>
              </g>
            );
          })}

          {/* Area filled from the zero line to each segment */}
          {plottedPoints.length > 1 &&
            plottedPoints.slice(1).map((point, index) => {
              const previous = plottedPoints[index];

              // Split area at zero when a segment crosses zero.
              const crossesZero =
                previous.value !== 0 &&
                point.value !== 0 &&
                Math.sign(previous.value) !== Math.sign(point.value);

              if (crossesZero) {
                const ratio =
                  Math.abs(previous.value) /
                  (Math.abs(previous.value) + Math.abs(point.value));

                const zeroX =
                  previous.x + (point.x - previous.x) * ratio;

                return (
                  <g key={`area-${index}`} pointerEvents="none">
                    <path
                      d={`M ${previous.x} ${getY(0)} L ${previous.x} ${previous.y} L ${zeroX} ${getY(0)} Z`}
                      fill={getValueColor(previous.value)}
                      fillOpacity="0.16"
                    />
                    <path
                      d={`M ${zeroX} ${getY(0)} L ${point.x} ${point.y} L ${point.x} ${getY(0)} Z`}
                      fill={getValueColor(point.value)}
                      fillOpacity="0.16"
                    />
                  </g>
                );
              }

              const color = getValueColor(
                (previous.value + point.value) / 2
              );

              return (
                <path
                  key={`area-${index}`}
                  d={[
                    `M ${previous.x} ${getY(0)}`,
                    `L ${previous.x} ${previous.y}`,
                    `L ${point.x} ${point.y}`,
                    `L ${point.x} ${getY(0)}`,
                    "Z",
                  ].join(" ")}
                  fill={color}
                  fillOpacity="0.16"
                  pointerEvents="none"
                />
              );
            })}

          {/* Individually colored GMP line segments */}
          {lineSegments.map((segment) => (
            <line
              key={segment.key}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke={segment.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              pointerEvents="none"
            />
          ))}

          {/* Full plot interaction area */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={chartWidth}
            height={chartHeight}
            fill="transparent"
            style={{ cursor: "crosshair" }}
          />

          {/* Vertical cursor indicator */}
          {activeIndex !== null && (
            <line
              x1={pointerX ?? tooltipPoint.x}
              y1={PAD.top}
              x2={pointerX ?? tooltipPoint.x}
              y2={H - PAD.bottom}
              stroke={activeColor}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              pointerEvents="none"
            />
          )}

          {/* Data points */}
          {plottedPoints.map((point, index) => {
            const color = getValueColor(point.value);

            return (
              <circle
                key={`${point.date}-${index}`}
                cx={point.x}
                cy={point.y}
                r={index === activeIndex ? 5 : 2.5}
                fill={index === activeIndex ? "#ffffff" : color}
                stroke={color}
                strokeWidth={index === activeIndex ? 2.5 : 1}
                pointerEvents="none"
              />
            );
          })}

          {/* Start date */}
          <text
            x={PAD.left}
            y={H - 14}
            textAnchor="start"
            fill="currentColor"
            fillOpacity="0.65"
            fontSize="10"
          >
            {dateFormat(points[0].date)}
          </text>

          {/* End date */}
          {points.length > 1 && (
            <text
              x={W - PAD.right}
              y={H - 14}
              textAnchor="end"
              fill="currentColor"
              fillOpacity="0.65"
              fontSize="10"
            >
              {dateFormat(points[points.length - 1].date)}
            </text>
          )}

          {/* Tooltip always rendered on top */}
          {activeIndex !== null && (
            <g pointerEvents="none">
              <rect
                x={tooltipX - TOOLTIP_WIDTH / 2}
                y={tooltipY}
                width={TOOLTIP_WIDTH}
                height={TOOLTIP_HEIGHT}
                rx="7"
                fill="#111827"
                stroke={activeColor}
                strokeWidth="1"
              />

              <text
                x={tooltipX}
                y={tooltipY + 17}
                textAnchor="middle"
                fill={activeColor}
                fontSize="12"
                fontWeight="700"
              >
                GMP: {INRFormat(tooltipPoint.value)}
              </text>

              <text
                x={tooltipX}
                y={tooltipY + 32}
                textAnchor="middle"
                fill="#f9fafb"
                fontSize="9"
              >
                {formatTooltipDate(tooltipPoint.date)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
