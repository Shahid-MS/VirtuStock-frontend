import { Link } from "react-router";

const STEPS = [
  {
    title: "Learn the IPO",
    text: "Read the verdict, GMP, financials and risks before you decide.",
  },
  {
    title: "Apply virtually",
    text: "Practise applying to an IPO with no real money involved.",
  },
  {
    title: "Track the result",
    text: "Check allotment, then see your profit or loss after listing.",
  },
];

export default function HowItWorks({ signedIn }: { signedIn: boolean }) {
  return (
    <div>
      <ol className="grid gap-3 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-theme-sm font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              {index + 1}
            </span>
            <p className="mt-2 text-theme-sm font-semibold text-gray-800 dark:text-white/90">
              {step.title}
            </p>
            <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
              {step.text}
            </p>
          </li>
        ))}
      </ol>

      {!signedIn && (
        <Link
          to="/signup"
          className="mt-4 inline-block text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
        >
          Create a free account →
        </Link>
      )}
    </div>
  );
}
