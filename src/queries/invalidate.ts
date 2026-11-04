import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

/**
 * Call after anything that changes the user's applied / allotted IPOs
 * (apply, edit application, edit allotment, unmark as applied).
 * Refreshes the dashboard list, the monthly charts and the per-IPO
 * "have I applied?" lookup.
 */
export const invalidateUserActivity = (
  queryClient: QueryClient,
  ipoId?: string
) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
    queryClient.invalidateQueries({
      queryKey: ipoId
        ? queryKeys.appliedStatus.byIpo(ipoId)
        : queryKeys.appliedStatus.all,
    }),
  ]);

/** Call after an admin edits one IPO: only that IPO's caches plus the lists. */
export const invalidateIpo = (queryClient: QueryClient, ipoId?: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.ipos.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.ipo.detail(ipoId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.ipo.gmp(ipoId) }),
  ]);

/** Call after IPOs are created/removed in bulk (fetch from source, delete). */
export const invalidateIpoLists = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.ipos.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.count }),
  ]);
