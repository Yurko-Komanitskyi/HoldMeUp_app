import { apiClient } from '@/shared/api/axios';

import type { Route } from '../model/route';
import type { CreateRouteInput, RouteListFilters, UpdateRouteInput } from './types';

const ROUTES_BASE = '/api/v1/routes';

export const routeKeys = {
  all: ['routes'] as const,
  lists: (filters?: RouteListFilters) => [...routeKeys.all, 'list', filters ?? {}] as const,
  list: (filters?: RouteListFilters) => [...routeKeys.lists(filters)] as const,
  details: () => [...routeKeys.all, 'detail'] as const,
  detail: (id: string) => [...routeKeys.details(), id] as const,
};

type RouteListResponse = {
  data: Route[];
  hasNextPage?: boolean;
};

export type RouteListResult = {
  routes: Route[];
  hasNextPage: boolean;
};

function buildParams(filters?: RouteListFilters): Record<string, unknown> {
  if (!filters) return {};
  const p: Record<string, unknown> = {};
  if (filters.page   != null)          p.page      = filters.page;
  if (filters.limit  != null)          p.limit     = filters.limit;
  if (filters.gymId)                   p.gymId     = filters.gymId;
  if (filters.sectorId)                p.sectorId  = filters.sectorId;
  if (filters.grade?.length)           p.grade     = filters.grade;
  if (filters.status?.length)          p.status    = filters.status;
  if (filters.style?.length)           p.style     = filters.style;
  if (filters.setterId)                p.setterId  = filters.setterId;
  if (filters.color)                   p.color     = filters.color;
  if (filters.search)                  p.search    = filters.search;
  return p;
}

export async function fetchRoutes(filters?: RouteListFilters): Promise<Route[]> {
  const { data } = await apiClient.get<Route[] | RouteListResponse>(ROUTES_BASE, {
    params: buildParams(filters),
  });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as RouteListResponse).data)) return (data as RouteListResponse).data;
  return [];
}

export async function fetchRoutesWithMeta(filters?: RouteListFilters): Promise<RouteListResult> {
  const { data } = await apiClient.get<Route[] | RouteListResponse>(ROUTES_BASE, {
    params: buildParams(filters),
  });
  if (Array.isArray(data))                             return { routes: data, hasNextPage: false };
  if (data && Array.isArray((data as RouteListResponse).data))
    return { routes: (data as RouteListResponse).data, hasNextPage: (data as RouteListResponse).hasNextPage ?? false };
  return { routes: [], hasNextPage: false };
}

export async function fetchRouteById(id: string): Promise<Route> {
  const { data } = await apiClient.get<Route>(`${ROUTES_BASE}/${id}`);
  return data;
}

export async function createRoute(input: CreateRouteInput): Promise<Route> {
  const { data } = await apiClient.post<Route>(ROUTES_BASE, input);
  return data;
}

export async function updateRoute(input: UpdateRouteInput): Promise<Route> {
  const { id, ...payload } = input;
  const { data } = await apiClient.patch<Route>(`${ROUTES_BASE}/${id}`, payload);
  return data;
}

export async function deleteRoute(id: string): Promise<void> {
  await apiClient.delete(`${ROUTES_BASE}/${id}`);
}

