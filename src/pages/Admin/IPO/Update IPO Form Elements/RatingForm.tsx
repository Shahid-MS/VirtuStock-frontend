import { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import ComponentCard from "../../../../components/common/ComponentCard";
import { UpdateIpoFormInput } from "../UpdateIpoSchema";

const STARS = [1, 2, 3, 4, 5];
const STAR_SIZE = 30;
const STAR_PATH =
  "m12 2.5 2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5Z";

const Star = ({ className }: { className: string }) => (
  <svg
    width={STAR_SIZE}
    height={STAR_SIZE}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d={STAR_PATH} />
  </svg>
);

interface RatingFormProps {
  setValue: UseFormSetValue<UpdateIpoFormInput>;
  watch: UseFormWatch<UpdateIpoFormInput>;
  /** The rating currently stored on the server, shown once it's changed. */
  savedValue?: number | null;
}

/**
 * Pick an IPO rating from 1 to 5 in half-star steps (left half of a star =
 * x.5, right half = x). Ratings stored with other decimals (e.g. 4.3) are
 * shown partially filled and kept as they are until a star is clicked.
 */
export default function RatingForm({
  setValue,
  watch,
  savedValue,
}: RatingFormProps) {
  const rating = Number(watch("rating") ?? 0);
  const [hovered, setHovered] = useState(0);

  // Hovering previews the rating the click would set.
  const shown = hovered || rating;

  const choose = (value: number) =>
    setValue("rating", value, { shouldDirty: true, shouldValidate: true });

  return (
    <ComponentCard title="Rating">
      <div className="flex items-center gap-3">
        <div
          role="radiogroup"
          aria-label="IPO rating"
          className="flex items-center gap-1"
          onMouseLeave={() => setHovered(0)}
        >
          {STARS.map((star) => {
            const fill = Math.min(Math.max(shown - (star - 1), 0), 1);

            return (
              <div
                key={star}
                className="relative"
                style={{ width: STAR_SIZE, height: STAR_SIZE }}
              >
                <Star className="fill-none stroke-gray-300 dark:stroke-gray-600" />
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className="fill-amber-400 stroke-amber-400" />
                </div>

                {[star - 0.5, star].map((value, half) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} stars`}
                    onMouseEnter={() => setHovered(value)}
                    onFocus={() => setHovered(value)}
                    onBlur={() => setHovered(0)}
                    onClick={() => choose(value)}
                    className={`absolute inset-y-0 w-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      half === 0 ? "left-0 rounded-l" : "right-0 rounded-r"
                    }`}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {rating ? `${Math.round(rating * 100) / 100} / 5` : "Not rated"}
        </span>
      </div>

      {rating !== Number(savedValue ?? 0) && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Currently saved:{" "}
          {savedValue ? `${Math.round(Number(savedValue) * 100) / 100} / 5` : "Not rated"}
        </p>
      )}
    </ComponentCard>
  );
}
