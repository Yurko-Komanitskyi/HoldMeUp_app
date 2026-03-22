import { useQuery } from '@tanstack/react-query';

import {
  fetchGymRoutesInventory,
  fetchGymStatsSummary,
  fetchMyStats,
  statsKeys,
  type MyStatsQueryParams,
} from '../api/statsApi';
import type { GymStatsDateQuery } from '../api/types';

export function useMyStatsQuery(params: MyStatsQueryParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: statsKeys.meQuery(params),
    queryFn: () => fetchMyStats(params),
    enabled: options?.enabled ?? true,
  });
}

export function useGymStatsSummaryQuery(
  gymId: string | undefined,
  params?: GymStatsDateQuery,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: gymId ? statsKeys.gymSummary(gymId, params ?? {}) : ['stats', 'gym', 'none'],
    queryFn: () => fetchGymStatsSummary(gymId!, params),
    enabled: !!gymId && (options?.enabled ?? true),
  });
}

export function useGymRoutesInventoryQuery(
  gymId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: gymId ? statsKeys.gymInventory(gymId) : ['stats', 'gym', 'none', 'inventory'],
    queryFn: () => fetchGymRoutesInventory(gymId!),
    enabled: !!gymId && (options?.enabled ?? true),
  });
}
