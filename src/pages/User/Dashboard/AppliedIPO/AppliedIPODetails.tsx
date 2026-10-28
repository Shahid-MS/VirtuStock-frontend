import { AppliedIPOInterface } from "../../../../Interface/IPO";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import AppliedIPOdetail from "./AppliedIPOdetail";
import AllotmentIPOdetail from "./AllotmentIPOdetail";
import { AllotmentStatus } from "@/Enum/AllotmentStatus";
import { dateFormat } from "@/Helper/dateHelper";
import { AllotmentPill, money } from "./AppliedIPOShared";

interface AppliedIPODetailsInterface {
  appliedIpo: AppliedIPOInterface;
  setAppliedIpo: Dispatch<SetStateAction<AppliedIPOInterface | undefined>>;
}

type StepState = "done" | "current" | "failed" | "skipped" | "upcoming";

interface Step {
  key: string;
  label: string;
  detail: string;
  state: StepState;
}

const NODE_STYLES: Record<StepState, string> = {
  done: "bg-brand-500 text-white",
  current:
    "border-2 border-brand-500 bg-white text-brand-500 dark:bg-[#171f2e]",
  failed: "bg-error-500 text-white",
  skipped: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
  upcoming:
    "border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-[#171f2e]",
};

function StepNode({ state }: { state: StepState }) {
  return (
    <span className="relative flex h-8 w-8 items-center justify-center">
      {state === "current" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-brand-400/40 motion-safe:animate-ping"
        />
      )}
      <span
        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 motion-reduce:transition-none ${NODE_STYLES[state]}`}
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
        {state === "failed" && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        )}
        {state === "current" && (
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
        )}
        {state === "skipped" && (
          <span className="h-0.5 w-3 rounded bg-current" />
        )}
      </span>
    </span>
  );
}

export default function AppliedIPODetails({
  appliedIpo,
  setAppliedIpo,
}: AppliedIPODetailsInterface) {
  const isAllotted = appliedIpo.allotment === AllotmentStatus.ALLOTED;
  const notAllotted = appliedIpo.allotment === AllotmentStatus.NOT_ALLOTED;
  const pending = !isAllotted && !notAllotted;

  const listingTime = new Date(appliedIpo.ipo.listingDate).getTime();
  const listed = isAllotted && !Number.isNaN(listingTime) && Date.now() >= listingTime;
  const sellPrice = appliedIpo.allotedIpo?.sellPrice ?? null;
  const sold = isAllotted && sellPrice !== null;

  const steps: Step[] = [
    {
      key: "applied",
      label: "Applied",
      detail: dateFormat(appliedIpo.appliedDate),
      state: "done",
    },
    {
      key: "allotment",
      label: "Allotment",
      detail: pending ? "Awaiting result" : isAllotted ? "Allotted" : "Not allotted",
      state: pending ? "current" : isAllotted ? "done" : "failed",
    },
    {
      key: "listing",
      label: "Listing",
      detail: dateFormat(appliedIpo.ipo.listingDate),
      state: notAllotted
        ? "skipped"
        : listed
        ? "done"
        : isAllotted
        ? "current"
        : "upcoming",
    },
    {
      key: "sold",
      label: "Sold",
      detail: sold ? money(sellPrice) : notAllotted ? "—" : "Not sold yet",
      state: notAllotted
        ? "skipped"
        : sold
        ? "done"
        : listed
        ? "current"
        : "upcoming",
    },
  ];

  // The line fills up to the last completed step, animating in on first paint.
  const lastDone = steps.reduce(
    (last, step, i) => (step.state === "done" ? i : last),
    0
  );
  const fill = (lastDone / (steps.length - 1)) * 100;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Progress */}
      <div className="border-b border-gray-100 p-5 dark:border-gray-800 lg:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Application progress
          </h3>
          <AllotmentPill status={appliedIpo.allotment} />
        </div>

        <ol className="relative grid grid-cols-4">
          {/* Track + animated fill, running between the first and last node centres */}
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 -translate-y-1/2 rounded bg-gray-200 dark:bg-gray-700"
          >
            <div
              className="h-full rounded bg-brand-500 transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ width: mounted ? `${fill}%` : "0%" }}
            />
          </div>

          {steps.map((step) => (
            <li
              key={step.key}
              aria-current={step.state === "current" ? "step" : undefined}
              className="relative flex min-w-0 flex-col items-center px-1 text-center"
            >
              <StepNode state={step.state} />
              <p
                className={`mt-2 text-xs font-medium sm:text-sm ${
                  step.state === "skipped"
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-800 dark:text-white/90"
                }`}
              >
                {step.label}
              </p>
              <p
                className={`w-full truncate text-[11px] sm:text-xs ${
                  step.state === "failed"
                    ? "text-error-600 dark:text-error-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                title={step.detail}
              >
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Details: stacked on phones, side by side once there is room */}
      <div
        className={`grid gap-8 p-5 lg:p-6 ${
          isAllotted ? "lg:grid-cols-2 lg:gap-6" : ""
        }`}
      >
        <AppliedIPOdetail appliedIpo={appliedIpo} setAppliedIpo={setAppliedIpo} />
        {isAllotted && (
          <AllotmentIPOdetail
            appliedIpo={appliedIpo}
            setAppliedIpo={setAppliedIpo}
          />
        )}
      </div>
    </section>
  );
}