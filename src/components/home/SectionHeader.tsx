import { ReactNode } from "react";

export default function SectionHeader({
  title,
  badge,
  right,
}: {
  title: string;
  badge?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex min-w-0 flex-wrap items-end justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h2>

        {badge && (
          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-theme-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            {badge}
          </span>
        )}
      </div>

      {right && <div className="min-w-0 max-w-full">{right}</div>}
    </div>
  );
}

export const SEE_ALL_LINK =
  "text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400";
