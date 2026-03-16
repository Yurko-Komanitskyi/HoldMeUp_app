import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchRoutesWithMeta, routeKeys } from '../api/routeApi';
import type { RouteListFilters } from '../api/types';

const PAGE_SIZE = 20;

export function useRoutesInfiniteQuery(
  filters: Omit<RouteListFilters, 'page' | 'limit'>,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: ['routes', 'infinite', filters],
    queryFn: ({ pageParam }) =>
      fetchRoutesWithMeta({ ...filters, page: pageParam as number, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasNextPage ? (lastPageParam as number) + 1 : undefined,
    enabled,
  });
}
