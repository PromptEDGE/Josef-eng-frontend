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

function subscribeTokenRefresh(cb: (token: string) => void) {
  pendingQueue.push({ resolve: cb, reject: () => {} });
}

function onRefreshed(token: string) {
  pendingQueue.forEach((p) => p.resolve(token));
  pendingQueue = [];
}

function resetQueueWithError(error: any) {
  pendingQueue.forEach((p) => p.reject(error));
  pendingQueue = [];
}

// Request: attach access token when present
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: refresh on 401 and retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            originalRequest._retry = true;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const resp = await axios.post(
          `${baseURL}/api/v1/auth/refresh`,
          { refresh_token: refresh },
          { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
        );
        const newAccess = resp.data?.access_token as string;
        const newRefresh = resp.data?.refresh_token || refresh;
        if (!newAccess) throw new Error('No access token in refresh response');

        setTokens({ accessToken: newAccess, refreshToken: newRefresh });
        onRefreshed(newAccess);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        clearTokens();
        resetQueueWithError(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

