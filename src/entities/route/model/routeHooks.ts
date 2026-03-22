import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchRouteById,
  fetchRoutesWithMeta,
  createRoute,
  updateRoute,
  deleteRoute,
  routeKeys,
} from '../api/routeApi';
import type { RouteListFilters } from '../api/types';
import { RouteGrade, RouteStatus, RouteStyle, type Route } from './route';
import { useInfiniteListQuery } from '@/shared/hooks/useInfiniteListQuery';

const ROUTES_PAGE_SIZE = 20;

export interface RouteFilters {
  gymId?: string;
  sectorId?: string;
  grade?: RouteGrade[];
  status?: RouteStatus;
  style?: RouteStyle;
  setterId?: string;
  color?: string;
  search?: string;
}

export function useRoutesQuery(filters?: RouteListFilters) {
  return useInfiniteListQuery<Route, RouteListFilters>({
    queryKey: routeKeys.list(filters),
    fetchFn: async (params) => {
      const result = await fetchRoutesWithMeta(params);
      return { data: result.routes, hasNextPage: result.hasNextPage };
    },
    params: filters,
    pageSize: ROUTES_PAGE_SIZE,
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
    onSuccess: (_void, id) => {
      queryClient.removeQueries({ queryKey: routeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });

  return { createRouteMutation, updateRouteMutation, deleteRouteMutation };
}
