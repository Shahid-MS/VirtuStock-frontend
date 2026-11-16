import { ReactNode } from "react";
import { IPOInterface } from "@/Interface/IPO";
import { splitByType } from "@/Helper/ipoGroups";

const SECTIONS = [
  {
    key: "mainboard" as const,
    title: "Mainboard",
    description: "Larger companies, listed on the NSE and BSE main boards",
  },
  {
    key: "sme" as const,
    title: "SME",
    description: "Smaller companies, higher risk and larger lot sizes",
  },
];

/**
 * Splits IPOs into a Mainboard section followed by an SME section. A section
 * with no IPOs stays visible with a short message, so it is clear it was checked.
 */
export default function TypeSections({
  ipos,
  emptyMessage,
  children,
}: {
  ipos: IPOInterface[];
  /** Shown inside a section that has no IPOs, e.g. "No SME IPOs are open right now." */
  emptyMessage: (typeTitle: string) => string;
  /** Renders the IPOs of one section. */
  children: (ipos: IPOInterface[]) => ReactNode;
}) {
  const groups = splitByType(ipos);

  return (
    <div className="space-y-8">
      {SECTIONS.map(({ key, title, description }) => {
        const list = groups[key];

        return (
          <section key={key} aria-label={title} className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-gray-200 pb-2 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {title}
              </h2>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-theme-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                {list.length}
              </span>
              <p className="w-full text-theme-xs text-gray-500 dark:text-gray-400 sm:ml-auto sm:w-auto">
                {description}
              </p>
            </div>

            {list.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-300 px-4 py-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {emptyMessage(title)}
              </p>
            ) : (
              children(list)
            )}
          </section>
        );
      })}
    </div>
  );
}
