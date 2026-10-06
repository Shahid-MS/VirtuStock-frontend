import { store } from "@/Store";

import axios from "axios";
import { toast } from "sonner";

declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export interface AxiosRequestConfig<D = any> {
    /** Set to true for optional requests that should fail silently. */
    skipErrorToast?: boolean;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  // Free-tier backends/databases can take a while to wake up.
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error?.config?.skipErrorToast) {
      const message = error?.response?.data?.message;

      if (message) {
        toast.error(message);
      } else if (!error?.response && error?.code !== "ERR_CANCELED") {
        toast.error("Can't reach the server. Please try again in a moment.", {
          id: "network-error",
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
