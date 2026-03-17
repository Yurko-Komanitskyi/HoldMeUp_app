import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchRoutes,
  fetchRouteById,
  fetchRoutesWithMeta,
  createRoute,
  updateRoute,
  deleteRoute,
  routeKeys,
} from '../api/routeApi';
import type { RouteListFilters } from '../api/types';

export function useRoutesQuery(filters?: RouteListFilters) {
  return useQuery({
    queryKey: routeKeys.list(filters),
    queryFn: () => fetchRoutes(filters),
  });
}

export function useRoutesWithMetaQuery(filters?: RouteListFilters) {
  return useQuery({
    queryKey: [...routeKeys.list(filters), 'meta'],
    queryFn: () => fetchRoutesWithMeta(filters),
  });
}

export function useRouteDetailsQuery(id: string) {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: () => fetchRouteById(id),
    enabled: !!id,
  });
}

export function useRouteMutations() {
  const queryClient = useQueryClient();

  const createRouteMutation = useMutation({
    mutationFn: createRoute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: routeKeys.lists() }),
  });

  const updateRouteMutation = useMutation({
    mutationFn: updateRoute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: routeKeys.lists() }),
  });

  return { createRouteMutation, updateRouteMutation, deleteRouteMutation };
}
