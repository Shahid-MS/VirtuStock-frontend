import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import ComponentCard from "../../../../components/common/ComponentCard";
import IPOVerdict from "../../../../components/ipo/IPOVerdict";
import { Verdict } from "../../../../Enum/Verdict";
import { UpdateIpoFormInput } from "../UpdateIpoSchema";

const VERDICT_OPTIONS: Verdict[] = [
  "STRONG_BUY",
  "BUY",
  "WAIT",
  "AVOID",
  "NOT_REVIEWED",
];

interface VerdictFormInterface {
  setValue: UseFormSetValue<UpdateIpoFormInput>;
  watch: UseFormWatch<UpdateIpoFormInput>;
  /** The verdict currently stored on the server, shown once it's changed. */
  savedValue?: string | null;
}

export default function VerdictForm({
  watch,
  setValue,
  savedValue,
}: VerdictFormInterface) {
  const selectedValue = watch("verdict");
  const changed = !!savedValue && selectedValue !== savedValue;

  return (
    <ComponentCard title="Verdict">
      <div
        role="radiogroup"
        aria-label="Verdict"
        className="flex flex-wrap items-center gap-3"
      >
        {VERDICT_OPTIONS.map((option) => {
          const selected = selectedValue === option;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() =>
                setValue("verdict", option, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className={`rounded-full p-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selected
                  ? "ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-900"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <IPOVerdict verdict={option} size="md" />
            </button>
          );
        })}
      </div>

      {changed && (
        <p className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          Currently saved:
          <IPOVerdict verdict={savedValue} />
        </p>
      )}
    </ComponentCard>
  );
}
