const BASICS = [
  {
    q: "What is GMP?",
    a: "Grey Market Premium is the unofficial extra price people are willing to pay for an IPO share before it lists. A positive GMP hints at a listing gain, but it is only a guide and can change daily.",
  },
  {
    q: "What is a lot size?",
    a: "IPOs can only be bid for in lots. A lot is a fixed number of shares, and your minimum investment is the lot size multiplied by the issue price.",
  },
  {
    q: "How does allotment work?",
    a: "When an IPO is oversubscribed, shares are allotted by a lottery-style process, so not every applicant gets shares. The registrar publishes the result a few days after bidding closes.",
  },
  {
    q: "What is Demat transfer and refund?",
    a: "After allotment, allotted shares are credited to your demat account and the money for shares you did not get is released from your bank. This happens just before the IPO lists.",
  },
];

/** Short plain-language answers, collapsed by default. */
export default function IpoBasics() {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
      {BASICS.map(({ q, a }) => (
        <details key={q} className="group px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-theme-sm font-medium text-gray-800 dark:text-white/90 [&::-webkit-details-marker]:hidden">
            {q}
            <span
              aria-hidden="true"
              className="text-gray-400 transition-transform group-open:rotate-90"
            >
              ›
            </span>
          </summary>
          <p className="mt-2 text-theme-sm text-gray-500 dark:text-gray-400">{a}</p>
        </details>
      ))}
    </div>
  );
}
