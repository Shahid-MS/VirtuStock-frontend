import { isAxiosError } from "axios";
import { toast } from "sonner";

/** The server's `message` for a failed request, or the error's own message. */
export const getApiErrorMessage = (error: unknown): string | undefined => {
  if (isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      (error.response
        ? `Request failed (${error.response.status})`
        : "Could not reach the server")
    );
  }
  return error instanceof Error ? error.message : undefined;
};

/**
 * The shared axios client (ApiClient.tsx) already shows a toast for any server
 * `message` and for network failures. Call this from a `catch` block to add a
 * fallback toast ONLY for the cases the interceptor stays silent about, so the
 * user never sees the same error twice.
 */
export const toastFallbackError = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response && !error.response.data?.message) {
      toast.error(fallback);
    }
    return;
  }

  toast.error(error instanceof Error ? error.message : fallback);
};
