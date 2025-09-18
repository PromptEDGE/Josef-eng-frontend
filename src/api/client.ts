import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/authTokens';

const baseURL = import.meta.env.VITE_BACKEND_URL as string;

// Create a single Axios instance for the app
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

// Attach access token if present before every request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: refresh on auth failure and retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = (error.config ?? {}) as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest.url || '';

    // Helpful in dev: see what we got back
    // console.debug('API error', { status, url, data: error.response?.data });

    // Do NOT intercept the refresh call itself
    const isRefreshCall = url?.includes('/api/v1/auth/refresh');

    // Detect “expired” both by HTTP status and common API error shapes
    const data = error.response?.data as any;
    const looksExpired =
      status === 401 ||
      status === 403 ||
      status === 419 ||
      status === 498 ||
      data?.error === 'token_expired' ||
      data?.code === 'token_expired' ||
      data?.message?.toString?.().toLowerCase?.().includes('expired');

    if (!isRefreshCall && looksExpired && !originalRequest._retry) {
      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        return Promise.reject(error);
      }

      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              originalRequest._retry = true;
              resolve(apiClient(originalRequest));
            },
            reject, // important: actually reject if refresh fails
          });
        });
      }

      // Start a new refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const resp = await axios.post(
          `${baseURL}/api/v1/auth/refresh`,
          { refresh_token: refresh },
          { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
        );

        // Adjust these keys to match your backend response
        const newAccess: string = resp.data?.access_token || resp.data?.access || resp.data?.token;
        const newRefresh: string = resp.data?.refresh_token || resp.data?.refresh || refresh;
        if (!newAccess) throw new Error('No access token in refresh response');

        setTokens({ accessToken: newAccess, refreshToken: newRefresh });

        // Flush success to all queued requests
        pendingQueue.forEach((p) => p.resolve(newAccess));
        pendingQueue = [];

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // Flush failure to all queued requests
        pendingQueue.forEach((p) => p.reject(refreshErr));
        pendingQueue = [];

        clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
