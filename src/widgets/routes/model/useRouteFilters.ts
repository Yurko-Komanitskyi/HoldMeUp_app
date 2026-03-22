import * as React from 'react';
import type { RouteListFilters } from '@/entities/route/api/types';
import { RouteFilters } from '@/entities/route/model/routeHooks';
import { RouteGrade, RouteStatus, RouteStyle } from '@/entities/route/model/route';

export function useRouteFilters() {
  const [filters, setFilters] = React.useState<RouteFilters>({
    gymId: undefined,
    sectorId: undefined,
    grade: undefined,
    status: undefined,
    style: undefined,
    setterId: undefined,
    color: undefined,
  });
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search?.trim() ?? ''), 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  const setSearch = React.useCallback(
    (v: string) => setFilters((f) => ({ ...f, search: v })),
    []
  );
  const setGrade = React.useCallback(
    (v: RouteGrade[] | undefined) => setFilters((f) => ({ ...f, grade: v })),
    []
  );
  const setStyle = React.useCallback(
    (v: RouteStyle | undefined) => setFilters((f) => ({ ...f, style: v })),
    []
  );
  const setStatus = React.useCallback(
    (v: RouteStatus | undefined) => setFilters((f) => ({ ...f, status: v })),
    []
  );
  const setColor = React.useCallback(
    (v: string | undefined) => setFilters((f) => ({ ...f, color: v })),
    []
  );
  const clearFilters = React.useCallback(() => {
    setFilters({
      gymId: undefined,
      sectorId: undefined,
      grade: undefined,
      status: undefined,
      style: undefined,
      setterId: undefined,
      color: undefined,
      search: undefined,
    });
    setDebouncedSearch('');
  }, []);

  const hasActiveFilters = !!(
    debouncedSearch ||
    filters.grade ||
    filters.style ||
    (filters.status && filters.status !== 'active') ||
    filters.color
  );

  const apiFilters: Omit<RouteListFilters, 'gymId' | 'page' | 'limit'> = React.useMemo(
    () => ({
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(filters.grade?.length ? { grade: filters.grade } : {}),
      ...(filters.style ? { style: [filters.style] } : {}),
      ...(filters.status ? { status: [filters.status] } : {}),
      ...(filters.color ? { color: filters.color } : {}),
    }),
    [debouncedSearch, filters.grade, filters.style, filters.status, filters.color]
  );

  return {
    filters,
    debouncedSearch,
    apiFilters,
    hasActiveFilters,
    setSearch,
    setGrade,
    setStyle,
    setStatus,
    setColor,
    clearFilters,
  };
}
