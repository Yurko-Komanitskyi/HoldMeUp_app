import { useQuery } from '@tanstack/react-query';

import { fetchRoutes, routeKeys } from '../api/routeApi';
import type { RouteListFilters } from '../api/types';

export function useRoutesQuery(filters?: RouteListFilters, enabled = true) {
  return useQuery({
    queryKey: routeKeys.lists(filters),
    queryFn: () => fetchRoutes(filters),
    enabled,
  });
}
