import { apiClient } from '@/shared/api/axios';
import type { UserAchievementDto } from './types';
export type { UserAchievementDto };

const BASE = '/api/v1/achievements';

export const achievementKeys = {
  all: ['achievements'] as const,
  mine: () => [...achievementKeys.all, 'me'] as const,
};

export async function fetchMyAchievements(): Promise<UserAchievementDto[]> {
  const { data } = await apiClient.get<UserAchievementDto[]>(`${BASE}/me`);
  return data;
}

/** Returns only the newly earned achievements from this recalculation. */
export async function recalculateMyAchievements(): Promise<UserAchievementDto[]> {
  const { data } = await apiClient.post<UserAchievementDto[]>(`${BASE}/me/recalculate`);
  return data ?? [];
}
