import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createFollow,
  unfollow,
  searchFollowUsers,
  fetchUserByTag,
  fetchFollowersByFollowerId,
  fetchFollowingByFollowingId,
  followKeys,
} from '../api/followApi';
import { useInfiniteListQuery } from '@/shared/hooks/useInfiniteListQuery';

const FOLLOW_PAGE_SIZE = 20;

export function useFollowSearchQuery(q: string) {
  const trimmed = q.trim();
  return useInfiniteListQuery({
    queryKey: followKeys.search(trimmed),
    fetchFn: searchFollowUsers,
    params: { q: trimmed },
    pageSize: FOLLOW_PAGE_SIZE,
    enabled: trimmed.length > 0,
  });
}

export function useUserByTagQuery(userTag: string) {
  return useQuery({
    queryKey: followKeys.byTag(userTag),
    queryFn: () => fetchUserByTag(userTag),
    enabled: !!userTag.trim(),
  });
}

export function useFollowersByFollowerIdQuery(followerId: string) {
  return useInfiniteListQuery({
    queryKey: followKeys.followers(followerId),
    fetchFn: fetchFollowersByFollowerId,
    params: { followerId },
    pageSize: FOLLOW_PAGE_SIZE,
    enabled: !!followerId,
  });
}

export function useFollowingByFollowingIdQuery(followingId: string) {
  return useInfiniteListQuery({
    queryKey: followKeys.following(followingId),
    fetchFn: fetchFollowingByFollowingId,
    params: { followingId },
    pageSize: FOLLOW_PAGE_SIZE,
    enabled: !!followingId,
  });
}

export function useFollowMutations() {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: createFollow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followKeys.all });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followKeys.all });
    },
  });

  return { followMutation, unfollowMutation };
}
