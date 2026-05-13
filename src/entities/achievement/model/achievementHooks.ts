import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  achievementKeys,
  fetchMyAchievements,
  recalculateMyAchievements,
} from '../api/achievementApi';
import { useAchievementToastStore } from '@/shared/ui/achievement-unlock-toast';

export function useMyAchievementsQuery() {
  return useQuery({
    queryKey: achievementKeys.mine(),
    queryFn: fetchMyAchievements,
    staleTime: 60_000,
  });
}

export function useRecalculateAchievements() {
  const queryClient = useQueryClient();
  const enqueue = useAchievementToastStore((s) => s.enqueue);
  return useMutation({
    mutationFn: recalculateMyAchievements,
    onSuccess: (newlyEarned) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.mine() });
      if (newlyEarned.length > 0) enqueue(newlyEarned);
    },
  });
}
