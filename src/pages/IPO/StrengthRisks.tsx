import { IPOProps } from "@/Interface/IPO";

function Column({
  title,
  items,
  tone,
  empty,
}: {
  title: string;
  items: string[];
  tone: "good" | "bad";
  empty: string;
}) {
  const good = tone === "good";
  return (
    <div
      className={`rounded-xl border p-5 ${
        good
          ? "border-success-100 bg-success-25 dark:border-success-500/20 dark:bg-success-500/5"
          : "border-error-100 bg-error-25 dark:border-error-500/20 dark:bg-error-500/5"
      }`}
    >
      <h4 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  good
                    ? "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400"
                    : "bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-400"
                }`}
              >
                {good ? "✓" : "!"}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function StrengthRisks({ ipo }: IPOProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Column
        title="Strengths"
        items={ipo.strengths ?? []}
        tone="good"
        empty="No strengths have been added yet."
      />
      <Column
        title="Risks"
        items={ipo.risks ?? []}
        tone="bad"
        empty="No risks have been added yet."
      />
    </div>
  );
}
