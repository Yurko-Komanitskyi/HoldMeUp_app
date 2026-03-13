import axios, { type InternalAxiosRequestConfig } from 'axios';
import { authSecureStore } from '@/entities/auth/model/authSecureStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type ApiError = {
  status: number;
  message: string;
};

export type RefreshCallback = () => Promise<string | null>;
export type AuthFailureCallback = () => void;

let refreshCallback: RefreshCallback | null = null;
let authFailureCallback: AuthFailureCallback | null = null;

export function setRefreshCallback(fn: RefreshCallback | null): void {
  refreshCallback = fn;
}

export function setAuthFailureCallback(fn: AuthFailureCallback | null): void {
  authFailureCallback = fn;
}

type RequestConfigWithRetry = InternalAxiosRequestConfig & {
  _retriedRefresh?: boolean;
};

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await authSecureStore.getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RequestConfigWithRetry | undefined;
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message ?? error.message ?? 'Unknown error';

    if (status === 401) {
      const requestUrl = originalRequest?.url ?? '';
      const isRefreshRequest =
        typeof requestUrl === 'string' && requestUrl.includes('/api/v1/auth/refresh');

      if (isRefreshRequest) {
        if (authFailureCallback) {
          authFailureCallback();
        }
        return Promise.reject({ status, message } satisfies ApiError);
      }

      if (refreshCallback && originalRequest && !originalRequest._retriedRefresh) {
        originalRequest._retriedRefresh = true;
        try {
          const newToken = await refreshCallback();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient.request(originalRequest);
          }
        } catch {
          // ignore refresh error, fall through to auth failure
        }
      }

      if (authFailureCallback) {
        authFailureCallback();
      }
    }

    return Promise.reject({ status, message } satisfies ApiError);
  }
);
