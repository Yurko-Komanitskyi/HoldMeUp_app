import type { User } from '@/shared/model/types';
import type { BaseListParams } from '@/shared/types/pagination';

export interface Follow {
  id: string;
  follower: User;
  following: User;
  createdAt: string;
  updatedAt: string;
}

export type UserWithFollowStatus = User & { isFollowedByMe: boolean };

export interface CreateFollowInput {
  followingId: string;
}

export interface UnfollowInput {
  followingId: string;
}

export type FollowSearchParams = BaseListParams & {
  q: string;
};

export type FollowerListParams = BaseListParams & {
  followerId: string;
};

export type FollowingListParams = BaseListParams & {
  followingId: string;
};

export type FollowSuggestionsParams = BaseListParams;
