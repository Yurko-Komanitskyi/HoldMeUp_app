import { apiClient } from '@/shared/api/axios';

import type {
  AscentStatsResponse,
  GymRoutesInventoryResponse,
  GymStatsDateQuery,
  GymStatsSummaryResponse,
  StatsPeriodPreset,
} from './types';

export const statsKeys = {
  all: ['stats'] as const,
  me: () => [...statsKeys.all, 'me'] as const,
  meQuery: (params: MyStatsQueryParams) => [...statsKeys.me(), params] as const,
  gym: (gymId: string) => [...statsKeys.all, 'gym', gymId] as const,
  gymSummary: (gymId: string, params: GymStatsDateQuery) =>
    [...statsKeys.gym(gymId), 'summary', params] as const,
  gymInventory: (gymId: string) => [...statsKeys.gym(gymId), 'routes', 'inventory'] as const,
};

const STATS_BASE = '/api/v1/stats';

export interface MyStatsQueryParams {
  period?: StatsPeriodPreset;
  dateFrom?: string;
  dateTo?: string;
  gymId?: string;
  compareWithPrevious?: boolean;
}

export async function fetchMyStats(params?: MyStatsQueryParams): Promise<AscentStatsResponse> {
  const { data } = await apiClient.get<AscentStatsResponse>(`${STATS_BASE}/me`, { params });
  return data;
}

export async function fetchGymStatsSummary(
  gymId: string,
  params?: GymStatsDateQuery
): Promise<GymStatsSummaryResponse> {
  const { data } = await apiClient.get<GymStatsSummaryResponse>(
    `${STATS_BASE}/gyms/${gymId}/summary`,
    { params }
  );
  return data;
}

export async function fetchGymRoutesInventory(
  gymId: string
): Promise<GymRoutesInventoryResponse> {
  const { data } = await apiClient.get<GymRoutesInventoryResponse>(
    `${STATS_BASE}/gyms/${gymId}/routes/inventory`
  );
  return data;
}
