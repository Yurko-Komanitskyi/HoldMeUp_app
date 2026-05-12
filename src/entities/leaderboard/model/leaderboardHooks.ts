import { useQuery } from '@tanstack/react-query';

import { useUserStore } from '@/entities/user/model/userStore';
import {
  fetchLeaderboard,
  leaderboardKeys,
  type LeaderboardQueryParams,
} from '../api/leaderboardApi';

export function useLeaderboardQuery(params: LeaderboardQueryParams, enabled = true) {
  const currentUserId = useUserStore((s) => s.currentUser?.id ?? '');

  return useQuery({
    queryKey: leaderboardKeys.list(params),
    queryFn: () => fetchLeaderboard(params, currentUserId),
    enabled,
    staleTime: 30_000,
  });
}
