import { apiClient } from '@/shared/api/axios';
import type { PaginatedListResponse } from '@/shared/types/pagination';

import type {
  CreateFollowInput,
  Follow,
  FollowSearchParams,
  FollowSuggestionsParams,
  FollowerListParams,
  FollowingListParams,
  UnfollowInput,
  UserWithFollowStatus,
} from './types';

const FOLLOWS_BASE = '/api/v1/follows';

export const followKeys = {
  all: ['follows'] as const,
  search: (q: string) => [...followKeys.all, 'search', q] as const,
  suggestions: () => [...followKeys.all, 'suggestions'] as const,
  byTag: (userTag: string) => [...followKeys.all, 'by-tag', userTag] as const,
  followers: (followerId: string) => [...followKeys.all, 'follower', followerId] as const,
  following: (followingId: string) => [...followKeys.all, 'following', followingId] as const,
};

export async function createFollow(input: CreateFollowInput): Promise<Follow> {
  const { data } = await apiClient.post<Follow>(FOLLOWS_BASE, input);
  return data;
}

export async function unfollow(input: UnfollowInput): Promise<void> {
  await apiClient.post(`${FOLLOWS_BASE}/unfollow`, input);
}

export async function searchFollowUsers(
  params: FollowSearchParams
): Promise<PaginatedListResponse<UserWithFollowStatus>> {
  const { data } = await apiClient.get<PaginatedListResponse<UserWithFollowStatus>>(
    `${FOLLOWS_BASE}/search`,
    { params }
  );
  return data;
}

export async function fetchUserByTag(userTag: string): Promise<UserWithFollowStatus> {
  const { data } = await apiClient.get<UserWithFollowStatus>(
    `${FOLLOWS_BASE}/by-tag/${encodeURIComponent(userTag)}`
  );
  return data;
}

export async function fetchFollowSuggestions(
  params: FollowSuggestionsParams
): Promise<PaginatedListResponse<UserWithFollowStatus>> {
  const { data } = await apiClient.get<PaginatedListResponse<UserWithFollowStatus>>(
    `${FOLLOWS_BASE}/suggestions`,
    { params }
  );
  return data;
}

export async function fetchFollowersByFollowerId(
  params: FollowerListParams
): Promise<PaginatedListResponse<Follow>> {
  const { followerId, page, limit } = params;
  const { data } = await apiClient.get<PaginatedListResponse<Follow>>(
    `${FOLLOWS_BASE}/follower/${followerId}`,
    { params: { page, limit } }
  );
  return data;
}

export async function fetchFollowingByFollowingId(
  params: FollowingListParams
): Promise<PaginatedListResponse<Follow>> {
  const { followingId, page, limit } = params;
  const { data } = await apiClient.get<PaginatedListResponse<Follow>>(
    `${FOLLOWS_BASE}/following/${followingId}`,
    { params: { page, limit } }
  );
  return data;
}
