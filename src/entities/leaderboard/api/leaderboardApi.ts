import { apiClient } from '@/shared/api/axios';
import { AscentType } from '@/entities/ascent/model/ascent';

import type { LeaderboardEntry, LeaderboardPeriod, LeaderboardScope } from '../model/types';
import { calculateScore, type RawAscent } from '../lib/scoring';

/* ─── backend DTOs ─────────────────────────────────────────────── */

interface BackendAscent {
  userId: string;
  routeId: string;
  grade: string;
  type: string | null;
  success: boolean;
  date: string;
}

interface BackendUser {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  userTag: string | null;
  photoUrl?: string | null;
}

interface BackendLeaderboardResponse {
  ascents: BackendAscent[];
  users: BackendUser[];
}

/* ─── query keys ───────────────────────────────────────────────── */

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  list: (params: LeaderboardQueryParams) => [...leaderboardKeys.all, 'list', params] as const,
};

export interface LeaderboardQueryParams {
  scope: LeaderboardScope;
  period: LeaderboardPeriod;
  gymId?: string | null;
  userIds?: string[];
}

/* ─── transformation ───────────────────────────────────────────── */

function transformResponse(
  data: BackendLeaderboardResponse,
  currentUserId: string,
): LeaderboardEntry[] {
  const userMap = new Map<string, BackendUser>(data.users.map((u) => [u.userId, u]));

  const ascentsByUser = new Map<string, BackendAscent[]>();
  for (const a of data.ascents) {
    const list = ascentsByUser.get(a.userId) ?? [];
    list.push(a);
    ascentsByUser.set(a.userId, list);
  }

  const entries: LeaderboardEntry[] = [];

  for (const [userId, ascents] of ascentsByUser) {
    const user = userMap.get(userId);
    if (!user) continue;

    const rawAscents: RawAscent[] = ascents
      .filter((a) => a.type != null && Object.values(AscentType).includes(a.type as AscentType))
      .map((a) => ({
        routeId: a.routeId,
        grade: a.grade,
        type: a.type as AscentType,
        success: a.success,
        date: a.date,
      }));

    const score = calculateScore(rawAscents);

    entries.push({
      userId,
      rank: 0,
      firstName: user.firstName,
      lastName: user.lastName,
      userTag: user.userTag,
      photoUrl: user.photoUrl,
      isCurrentUser: userId === currentUserId,
      score,
    });
  }

  entries.sort((a, b) => b.score.totalPoints - a.score.totalPoints);
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  return entries;
}

/* ─── API call ─────────────────────────────────────────────────── */

const LEADERBOARD_BASE = '/api/v1/leaderboard';

export async function fetchLeaderboard(
  params: LeaderboardQueryParams,
  currentUserId: string,
): Promise<LeaderboardEntry[]> {
  const userIdsParam =
    params.userIds?.length ? params.userIds.map((id) => id.trim()).filter(Boolean).join(',') : undefined;

  const { data } = await apiClient.get<BackendLeaderboardResponse>(LEADERBOARD_BASE, {
    params: {
      scope: params.scope,
      period: params.period,
      ...(params.gymId ? { gymId: params.gymId } : {}),
      ...(userIdsParam ? { userIds: userIdsParam } : {}),
    },
  });

  if (!data || typeof data !== 'object') return [];
  const raw = data as BackendLeaderboardResponse;
  if (!Array.isArray(raw.ascents) || !Array.isArray(raw.users)) return [];

  return transformResponse(raw, currentUserId);
}
