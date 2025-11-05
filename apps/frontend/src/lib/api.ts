import axios from "axios";
import { loader } from "../ui/loading/loaderContext";
import { notify } from "../ui/notifications/notify";

// Resolve base API URL from (build-time) NEXT_PUBLIC_API_URL, or runtime window._API,
// falling back to localhost for local dev. Keep the `/api` prefix so calls like
// `/deposits` map to Nest controller routes declared under `@Controller('api/deposits')`.
const resolvedApiHost = (
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  (typeof window !== "undefined" && (window as any)._API) ||
  "http://localhost:3001"
).replace(/\/$/, "");
const api = axios.create({
  baseURL: `${resolvedApiHost}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach access token if present and debounce per-request loader so very fast
// requests don't flash the global loader. We store the timer on the request
// config so concurrent requests don't interfere.
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token && config && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  // debounce loader show using a timer attached to this request config
  const anyConfig: any = config;
  if (anyConfig.__loaderTimer) clearTimeout(anyConfig.__loaderTimer);
  anyConfig.__loaderTimer = setTimeout(() => {
    try {
      loader.show("Loading...");
      anyConfig.__loaderShown = true;
    } catch (e) {}
  }, 200);
  return config;
});

// Response interceptor: on 401, try refresh once and retry original request
api.interceptors.response.use(
  (res) => {
    try {
      const anyConfig: any = res.config || {};
      if (anyConfig.__loaderTimer) {
        clearTimeout(anyConfig.__loaderTimer);
        anyConfig.__loaderTimer = null;
      }
      if (anyConfig.__loaderShown) loader.hide();
    } catch (e) {}
    return res;
  },
  async (err) => {
    try {
      const anyConfig: any = (err && err.config) || {};
      if (anyConfig.__loaderTimer) {
        clearTimeout(anyConfig.__loaderTimer);
        anyConfig.__loaderTimer = null;
      }
      if (anyConfig.__loaderShown) loader.hide();
    } catch (e) {}
    const original = err.config;
    // If there's no original config or we've already retried, surface errors to callers
    if (!original || original._retry) {
      // Network error (no response) — e.g., backend down or CORS/network issue
      if (!err.response) {
        notify.error(
          "Network error: cannot reach API. Please check the server or your connection."
        );
        return Promise.reject(err);
      }
      // HTTP response present
      const status = err.response.status;
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.response.statusText;
      if (status >= 500) {
        notify.error(
          `Server error (${status}): ${
            serverMsg || "An unexpected error occurred."
          }`
        );
      } else if (status >= 400) {
        notify.error(serverMsg || `Request failed (${status}).`);
      }
      return Promise.reject(err);
    }
    if (err.response && err.response.status === 401) {
      original._retry = true;
      try {
        const r = await api.post("/auth/refresh");
        if (r && r.data) {
          const { accessToken, user } = r.data;
          if (accessToken) localStorage.setItem("accessToken", accessToken);
          if (user) localStorage.setItem("user", JSON.stringify(user));
          // set header and retry
          if (original.headers)
            original.headers["Authorization"] = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch (e) {
        // refresh failed -> clear tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

// Helper to create requests with progress tracking
export const apiWithProgress = (progressId: string) => {
  const instance = axios.create({
    baseURL: api.defaults.baseURL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
    onUploadProgress: (progressEvent) => {
      const percent = (progressEvent.loaded / (progressEvent.total || 1)) * 100;
      notify.updateProgress(progressId, percent);
    },
    onDownloadProgress: (progressEvent) => {
      const percent = (progressEvent.loaded / (progressEvent.total || 1)) * 100;
      notify.updateProgress(progressId, percent);
    },
  });

  // Add auth interceptor
  instance.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token && config && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  });

  return instance;
};

export default api;
