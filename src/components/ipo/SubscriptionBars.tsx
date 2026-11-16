import { SubscriptionProps } from "@/Interface/IPO";
import { formatMultiple, subscriptionEntries } from "@/Helper/ipoHelper";

/** Visual subscription breakdown: headline total + one bar per category. */
export default function SubscriptionBars({ subscription }: SubscriptionProps) {
  const entries = subscriptionEntries(subscription);
  const isTotal = (label: string) => /total|overall/i.test(label);

  const total = entries.find((e) => isTotal(e.label));
  const categories = entries.filter((e) => !isTotal(e.label));
  const rows = categories.length ? categories : entries;
  const max = Math.max(1, ...rows.map((r) => r.value ?? 0));

  if (!entries.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Subscription data isn't available yet. It appears once bidding opens.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {total && (
        <div>
          <p className="text-theme-xs text-gray-500 dark:text-gray-400">
            Total subscription
          </p>
          <p className="text-3xl font-semibold text-gray-800 dark:text-white/90">
            {formatMultiple(total.value)}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {rows.map(({ label, value }) => {
          const width = value === null ? 0 : Math.max(2, (value / max) * 100);
          return (
            <div key={label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-theme-sm">
                <span className="text-gray-600 dark:text-gray-300">{label}</span>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {formatMultiple(value)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full ${
                    value !== null && value >= 1
                      ? "bg-success-500"
                      : "bg-warning-500"
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-theme-xs text-gray-400 dark:text-gray-500">
        Below 1x means the category isn't fully subscribed yet.
      </p>
    </div>
  );
}
