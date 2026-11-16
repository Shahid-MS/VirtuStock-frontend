import { QueryClient } from "@tanstack/react-query";

// One shared client for the whole app. Creating it inside <App /> would throw
// the cache away on every re-render and cause duplicate API calls.
// Each query sets its own staleTime where caching makes sense (see
// src/queries/ipoQueries.ts); everything else stays "always fresh on mount".
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
