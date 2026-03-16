import * as React from 'react';
import type { RouteListFilters } from '@/entities/route/api/types';

export interface RouteUiFilters {
  searchRaw: string;
  grade:     string | null;
  style:     string | null;
  status:    string | null;
  color:     string | null;
}

const INITIAL: RouteUiFilters = {
  searchRaw: '',
  grade:     null,
  style:     null,
  status:    'ACTIVE',
  color:     null,
};

export function useRouteFilters() {
  const [filters, setFilters] = React.useState<RouteUiFilters>(INITIAL);
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.searchRaw.trim()), 400);
    return () => clearTimeout(t);
  }, [filters.searchRaw]);

  const setSearchRaw = React.useCallback((v: string) =>        setFilters((f) => ({ ...f, searchRaw: v })), []);
  const setGrade     = React.useCallback((v: string | null) => setFilters((f) => ({ ...f, grade: v })),     []);
  const setStyle     = React.useCallback((v: string | null) => setFilters((f) => ({ ...f, style: v })),     []);
  const setStatus    = React.useCallback((v: string | null) => setFilters((f) => ({ ...f, status: v })),    []);
  const setColor     = React.useCallback((v: string | null) => setFilters((f) => ({ ...f, color: v })),     []);
  const clearFilters = React.useCallback(() => { setFilters(INITIAL); setDebouncedSearch(''); },             []);

  const hasActiveFilters = !!(
    debouncedSearch || filters.grade || filters.style ||
    (filters.status && filters.status !== 'ACTIVE') || filters.color
  );

  const apiFilters: Omit<RouteListFilters, 'gymId' | 'page' | 'limit'> = React.useMemo(() => ({
    ...(debouncedSearch    ? { search: debouncedSearch       } : {}),
    ...(filters.grade      ? { grade:  [filters.grade]       } : {}),
    ...(filters.style      ? { style:  [filters.style]       } : {}),
    ...(filters.status     ? { status: [filters.status]      } : {}),
    ...(filters.color      ? { color:  filters.color         } : {}),
  }), [debouncedSearch, filters.grade, filters.style, filters.status, filters.color]);

  return {
    filters,
    debouncedSearch,
    apiFilters,
    hasActiveFilters,
    setSearch: setSearchRaw,
    setGrade,
    setStyle,
    setStatus,
    setColor,
    clearFilters,
  };
}
