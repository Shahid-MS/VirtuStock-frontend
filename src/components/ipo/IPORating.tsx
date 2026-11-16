const STAR_PATH =
  "m12 2.5 2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5Z";
const STARS = [0, 1, 2, 3, 4];

/** A usable rating is a number from above 0 up to 5; anything else is "no rating". */
export const parseRating = (rating?: number | string | null): number | null => {
  if (rating === null || rating === undefined || rating === "") return null;
  const value = Number(rating);
  return Number.isFinite(value) && value > 0 && value <= 5 ? value : null;
};

const Star = ({ size, className }: { size: number; className: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d={STAR_PATH} />
  </svg>
);

/** Read-only stars; fractions (3.5, 4.3) fill the star partially. */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {STARS.map((index) => {
        const fill = Math.min(Math.max(value - index, 0), 1);

        return (
          <span
            key={index}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              className="fill-none stroke-gray-300 dark:stroke-gray-600"
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star size={size} className="fill-amber-400 stroke-amber-400" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Admin rating as stars plus the number. Renders nothing when unrated. */
export default function IPORating({
  rating,
  className = "",
}: {
  rating?: number | string | null;
  className?: string;
}) {
  const value = parseRating(rating);
  if (value === null) return null;

  const text = String(Math.round(value * 10) / 10);

  return (
    <span
      role="img"
      aria-label={`Rating ${text} out of 5`}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <Stars value={value} />
      <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
        {text}
        <span className="font-normal text-gray-500 dark:text-gray-400">/5</span>
      </span>
    </span>
  );
}
