import { Link } from "react-router";
import { CalendarDay, CalendarEventKind } from "@/Helper/ipoGroups";

const KIND: Record<CalendarEventKind, { label: string; classes: string }> = {
  open: {
    label: "Opens",
    classes:
      "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
  },
  close: {
    label: "Closes",
    classes:
      "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-orange-400",
  },
  allotment: {
    label: "Allotment",
    classes:
      "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400",
  },
  listing: {
    label: "Lists",
    classes: "bg-gray-100 text-gray-700 dark:bg-white/[0.08] dark:text-gray-300",
  },
};

const dayName = (date: Date) =>
  date.toLocaleDateString("en-GB", { weekday: "short" });

/** Monday to Sunday of this week: what opens, closes, gets allotted and lists. */
export default function WeekCalendar({ days }: { days: CalendarDay[] }) {
  return (
    <ol className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:grid-cols-7 md:overflow-visible md:px-0">
      {days.map((day) => (
        <li
          key={day.key}
          aria-current={day.isToday ? "date" : undefined}
          className={`min-h-24 w-28 shrink-0 snap-start rounded-xl border p-2 md:w-auto md:min-w-0 ${
            day.isToday
              ? "border-brand-400 bg-brand-50/60 dark:border-brand-500/50 dark:bg-brand-500/10"
              : "border-gray-200 dark:border-gray-800"
          }`}
        >
          <p
            className={`mb-1.5 text-theme-xs font-medium ${
              day.isToday
                ? "text-brand-600 dark:text-brand-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {dayName(day.date)} {day.date.getDate()}
          </p>

          <ul className="space-y-1">
            {day.events.map(({ kind, ipo }) => (
              <li key={`${kind}-${ipo.id}`}>
                <Link
                  to={`/ipo/${ipo.id}`}
                  title={`${KIND[kind].label}: ${ipo.name}`}
                  className={`block truncate rounded-md px-1.5 py-1 text-[11px] leading-tight hover:opacity-80 ${KIND[kind].classes}`}
                >
                  {KIND[kind].label}: {ipo.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
