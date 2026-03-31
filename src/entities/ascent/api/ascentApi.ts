import { apiClient } from '@/shared/api/axios';

import type { Ascent, AscentFeedItem } from '../model/ascent';
import type {
  AddAscentReactionInput,
  AscentFeedParams,
  CreateAscentInput,
  UpdateAscentInput,
} from './types';
import { PaginatedListResponse } from '@/shared/types/pagination';

export const ascentKeys = {
  all: ['ascents'] as const,
  lists: () => [...ascentKeys.all, 'list'] as const,
  list: () => [...ascentKeys.lists()] as const,
  feeds: () => [...ascentKeys.all, 'feed'] as const,
  feed: (params?: Omit<AscentFeedParams, 'page' | 'limit'>) =>
    [...ascentKeys.feeds(), params ?? {}] as const,
  details: () => [...ascentKeys.all, 'detail'] as const,
  detail: (id: string) => [...ascentKeys.details(), id] as const,
};

const ASCENTS_BASE = '/api/v1/ascents';

export type AscentListParams = {
  page?: number;
  limit?: number;
  userId?: string;
};

export async function fetchAscents(
  params?: AscentListParams
): Promise<PaginatedListResponse<Ascent>> {
  const { data } = await apiClient.get<PaginatedListResponse<Ascent>>(ASCENTS_BASE, {
    params,
  });
  return data;
}

export async function fetchAscentFeed(
  params?: AscentFeedParams
): Promise<PaginatedListResponse<AscentFeedItem>> {
  const { data } = await apiClient.get<PaginatedListResponse<AscentFeedItem>>(
    `${ASCENTS_BASE}/feed`,
    { params }
  );
  return data;
}

export async function addAscentReaction(
  ascentId: string,
  input: AddAscentReactionInput
): Promise<void> {
  await apiClient.post(`${ASCENTS_BASE}/${ascentId}/reactions`, input);
}

export async function deleteAscentReaction(ascentId: string): Promise<void> {
  await apiClient.delete(`${ASCENTS_BASE}/${ascentId}/reactions`);
}

export async function fetchAscentById(id: string): Promise<Ascent> {
  const { data } = await apiClient.get<Ascent>(`${ASCENTS_BASE}/${id}`);
  return data;
}

export async function createAscent(input: CreateAscentInput): Promise<Ascent> {
  const { data } = await apiClient.post<Ascent>(ASCENTS_BASE, input);
  return data;
}

export async function updateAscent(input: UpdateAscentInput): Promise<Ascent> {
  const { id, ...payload } = input;
  const { data } = await apiClient.patch<Ascent>(`${ASCENTS_BASE}/${id}`, payload);
  return data;
}

export async function deleteAscent(id: string): Promise<void> {
  await apiClient.delete(`${ASCENTS_BASE}/${id}`);
}
