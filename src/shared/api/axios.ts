import axios, { type InternalAxiosRequestConfig } from 'axios';
import { authSecureStore } from '@/entities/auth/model/authSecureStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type ApiError = {
  status: number;
  message: string;
  errorCode?: string;
  errors?: Record<string, string>;
};

export const authAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});


let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

let signOutCallback: (() => void) | null = null;

export function setSignOutCallback(fn: (() => void) | null): void {
  signOutCallback = fn;
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.request.use(async (config) => {
  const token = await authSecureStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig | undefined;
    const status: number = error.response?.status ?? 0;
    const message: string = error.response?.data?.message ?? error.message ?? 'Unknown error';

    if (status !== 401) {
      return Promise.reject({
        status,
        message,
        errorCode: error.response?.data?.errorCode,
        errors:    error.response?.data?.errors,
      } satisfies ApiError);
    }

    if (config?._retry) {
      return Promise.reject({ status, message } satisfies ApiError);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        config!.headers.Authorization = `Bearer ${newToken}`;
        config!._retry = true;
        return apiClient(config!);
      });
    }

    config!._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await authSecureStore.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await authAxios.post<{ token: string; refreshToken: string }>(
        '/api/v1/auth/refresh',
        undefined,
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );

      await authSecureStore.saveAccessToken(data.token);
      await authSecureStore.saveRefreshToken(data.refreshToken);

      flushQueue(null, data.token);
      config!.headers.Authorization = `Bearer ${data.token}`;
      return apiClient(config!);
    } catch {
      flushQueue(new Error('Refresh failed'), null);
      await authSecureStore.logout();
      signOutCallback?.();
      return Promise.reject({
        status: 401,
        message: 'Сесія закінчилась. Будь ласка, увійдіть знову.',
      } satisfies ApiError);
    } finally {
      isRefreshing = false;
    }
  }
);
