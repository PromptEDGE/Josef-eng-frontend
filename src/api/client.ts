import { logger } from "@/utils/logger";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL as string;

// Create a single Axios instance for the app with cookie support
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true, // CRITICAL: Enable credentials for httpOnly cookies
});

// CSRF token management
let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  try {
    const response = await axios.get(`${baseURL}/api/v1/auth/csrf-token`, {
      withCredentials: true,
    });
    csrfToken = response.data.token;
    return csrfToken;
  } catch (error) {
    throw new Error('Failed to fetch CSRF token');
  }
}

// Request interceptor: Attach CSRF token to state-changing requests
apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();

  // Attach CSRF token to POST/PUT/PATCH/DELETE requests
  if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
    try {
      const token = await getCsrfToken();
      config.headers['X-CSRF-Token'] = token;
    } catch (error) {
      // If CSRF token fetch fails, continue without it (will fail on backend)
    }
  }

  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (value: any) => void; reject: (err: any) => void }> = [];

// Response interceptor: Auto-refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = (error.config ?? {}) as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest.url || '';

    // Do NOT intercept the refresh call itself
    const isRefreshCall = url?.includes('/api/v1/auth/refresh');

    // Detect auth errors (401/403)
    const isAuthError = status === 401 || status === 403;

    if (!isRefreshCall && isAuthError && !originalRequest._retry) {
      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: () => {
              originalRequest._retry = true;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      // Start a new refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint (reads refresh_token from cookie, sets new access_token cookie)
        await axios.post(
          `${baseURL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Flush success to all queued requests
        pendingQueue.forEach((p) => p.resolve(undefined));
        pendingQueue = [];

        // Retry the original request (cookie automatically attached)
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // Flush failure to all queued requests
        pendingQueue.forEach((p) => p.reject(refreshErr));
        pendingQueue = [];

        // Redirect to signin on refresh failure
        window.location.href = '/signin';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
