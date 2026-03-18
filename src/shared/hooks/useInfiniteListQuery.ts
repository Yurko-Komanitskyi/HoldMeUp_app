import { useInfiniteQuery, QueryKey } from '@tanstack/react-query';
import { BaseListParams, PaginatedListResponse } from '../types/pagination';

const DEFAULT_PAGE_SIZE = 20;

interface UseInfiniteListQueryOptions<T, P extends BaseListParams> {
  queryKey: QueryKey;
  fetchFn: (params: P) => Promise<PaginatedListResponse<T>>;
  params?: Omit<P, 'page' | 'limit'>;
  pageSize?: number;
  enabled?: boolean;
}

export function useInfiniteListQuery<T, P extends BaseListParams>({
  queryKey,
  fetchFn,
  params,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
}: UseInfiniteListQueryOptions<T, P>) {
  const query = useInfiniteQuery({
    queryKey: [...queryKey, params], // фільтри в ключі — важливо!
    queryFn: ({ pageParam = 1 }) => fetchFn({ ...params, page: pageParam, limit: pageSize } as P),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled,
  });

  // flatten pages в один масив — зручніше для UI
  const items = query.data?.pages.flatMap((p) => p.data) ?? [];

  return {
    ...query,
    items,
    isEmpty: query.isSuccess && items.length === 0,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
  };
}
