import { apiClient } from '@/shared/api/axios';

import type { Ascent } from '../model/ascent';
import type { CreateAscentInput, UpdateAscentInput } from './types';

export const ascentKeys = {
  all: ['ascents'] as const,
  lists: () => [...ascentKeys.all, 'list'] as const,
  list: () => [...ascentKeys.lists()] as const,
  details: () => [...ascentKeys.all, 'detail'] as const,
  detail: (id: string) => [...ascentKeys.details(), id] as const,
};

const ASCENTS_BASE = '/api/v1/ascents';

export async function fetchAscents(): Promise<Ascent[]> {
  const { data } = await apiClient.get<Ascent[]>(ASCENTS_BASE);
  return Array.isArray(data) ? data : [];
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

