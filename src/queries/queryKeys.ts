/**
 * Central registry of React Query keys.
 *
 * Keys are hierarchical so a mutation can invalidate exactly the data it
 * changed (e.g. `queryKeys.user.all` covers every user-activity query) instead
 * of triggering broad refetches.
 */
export const queryKeys = {
  ipos: {
    all: ["ipos"] as const,
    open: ["ipos", "open"] as const,
    upcoming: ["ipos", "upcoming"] as const,
    list: (page: number, size: number, status: string, verdict: string, type: string) =>
      ["ipos", "list", page, size, status, verdict, type] as const,
  },
  ipo: {
    detail: (id?: string) => ["ipo", id] as const,
    gmp: (id?: string) => ["ipo-gmp", id] as const,
  },
  search: (term: string) => ["ipo-search", term] as const,
  appliedStatus: {
    all: ["applied-status"] as const,
    byIpo: (ipoId?: string) => ["applied-status", ipoId] as const,
  },
  user: {
    /** Prefix covering every query derived from the user's applications. */
    all: ["user"] as const,
    appliedIpos: (page: number, size: number) =>
      ["user", "applied-ipos", page, size] as const,
    monthlySummary: (year: number) => ["user", "monthly-summary", year] as const,
    monthlyProfit: (year: number) => ["user", "monthly-profit", year] as const,
  },
  admin: {
    count: ["admin", "count"] as const,
    usersAll: ["admin", "users"] as const,
    users: (page: number, size: number) => ["admin", "users", page, size] as const,
  },
  rating: ["rating"] as const,
  myRating: ["my-rating"] as const,
};
