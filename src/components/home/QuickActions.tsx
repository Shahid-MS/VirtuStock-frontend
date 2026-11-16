import { Link } from "react-router";
import { BoltIcon, GridIcon, ListIcon, ShieldCheckIcon } from "@/icons";

const ACTIONS = [
  { label: "Open IPOs", to: "/ipo/open", icon: <BoltIcon /> },
  { label: "Allotment", to: "/ipo/allotment", icon: <ShieldCheckIcon /> },
  { label: "Compare IPOs", to: "/ipo/compare", icon: <ListIcon /> },
  { label: "All IPOs", to: "/ipo/all", icon: <GridIcon /> },
];

/** One-tap shortcuts to the main IPO pages. */
export default function QuickActions() {
  return (
    <nav aria-label="Quick actions" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ACTIONS.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-3.5 text-center text-theme-sm font-medium text-gray-700 transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-500/40 dark:hover:bg-white/[0.03]"
        >
          <span className="text-brand-500 dark:text-brand-400 [&>svg]:size-5">
            {action.icon}
          </span>
          {action.label}
        </Link>
      ))}
    </nav>
  );
}
