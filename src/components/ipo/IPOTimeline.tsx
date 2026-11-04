import { IPOInterface } from "@/Interface/IPO";
import { dateFormat } from "@/Helper/dateHelper";

type StepState = "done" | "current" | "upcoming";

const STEP_LABELS = ["Opens", "Bidding", "Allotment", "Listing", "Listed"];

/** Index of the current step; STEP_LABELS.length means every step is done. */
const currentStepIndex = (ipo: IPOInterface): number | null => {
  const status = (ipo.status ?? "").toUpperCase();

  if (status === "LISTED" || Number(ipo.listedPrice) > 0) {
    return STEP_LABELS.length;
  }

  switch (status) {
    case "UPCOMING":
      return 0;
    case "OPEN":
      return 1;
    case "CLOSED":
    case "ALLOTMENT_PENDING":
    case "ALLOTMENT":
      return 2;
    case "LISTING_PENDING":
      return 3;
    default:
      return null;
  }
};

const day = (date?: string | null) => (date ? dateFormat(date) : "—");

const NODE_STYLES: Record<StepState, string> = {
  done: "border-brand-500 bg-brand-500 text-white",
  current:
    "border-brand-500 bg-white text-brand-500 dark:bg-[#171f2e] dark:text-brand-400",
  upcoming:
    "border-gray-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-[#171f2e]",
};

/** Where the IPO is in its life: opens, bidding, allotment, listing, listed. */
export default function IPOTimeline({ ipo }: { ipo: IPOInterface }) {
  const current = currentStepIndex(ipo);

  // Unknown status: better to show nothing than a wrong timeline.
  if (current === null) return null;

  const listed = current >= STEP_LABELS.length;

  const details = [
    day(ipo.startDate),
    current > 1 ? `Closed ${day(ipo.endDate)}` : `Closes ${day(ipo.endDate)}`,
    current > 2 ? "Done" : current === 2 ? "Awaiting result" : "Result pending",
    current > 3 ? day(ipo.listingDate) : `Lists ${day(ipo.listingDate)}`,
    listed ? "Done" : "—",
  ];

  return (
    <section
      aria-label="IPO progress"
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <ol className="flex">
        {STEP_LABELS.map((label, index) => {
          const state: StepState =
            index < current ? "done" : index === current ? "current" : "upcoming";

          return (
            <li
              key={label}
              aria-current={state === "current" ? "step" : undefined}
              className="relative min-w-0 flex-1 px-1 text-center"
            >
              {index < STEP_LABELS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-1/2 top-4 h-0.5 w-full ${
                    index < current
                      ? "bg-brand-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}

              <span
                className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 ${NODE_STYLES[state]}`}
              >
                {state === "done" && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                )}
                {state === "current" && (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </span>

              <p className="mt-2 text-xs font-medium text-gray-800 dark:text-white/90 sm:text-sm">
                {label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-gray-400 sm:text-xs">
                {details[index]}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}