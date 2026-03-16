import { useQuery } from '@tanstack/react-query';
import { fetchRouteById, routeKeys } from '../api/routeApi';

export function useRouteQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: () => fetchRouteById(id),
    enabled: !!id && enabled,
  });
}
