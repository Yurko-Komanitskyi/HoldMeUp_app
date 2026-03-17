import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/axios';

function shouldRetry(failureCount: number, error: unknown): boolean {
  const err = error as ApiError | undefined;
  if (err?.status === 401 || err?.status === 403) return false;
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      staleTime: 60_000,
    },
    mutations: {
      retry: false,
    },
  },
});
