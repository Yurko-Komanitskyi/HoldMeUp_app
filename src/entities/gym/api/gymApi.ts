import { apiClient } from '@/shared/api/axios';

import type { Gym } from '../model/gym';
import type { CreateGymInput, UpdateGymInput } from './types';

export const gymKeys = {
  all: ['gyms'] as const,
  lists: () => [...gymKeys.all, 'list'] as const,
  list: () => [...gymKeys.lists()] as const,
  autoJoin: () => [...gymKeys.all, 'autoJoin'] as const,
  details: () => [...gymKeys.all, 'detail'] as const,
  detail: (id: string) => [...gymKeys.details(), id] as const,
};

type GymListResponse = {
  data: Gym[];
  hasNextPage: boolean;
};

function unwrapGymList(data: Gym[] | GymListResponse): Gym[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function unwrapGymItem(data: Gym | GymListResponse): Gym {
  if (data && !Array.isArray(data) && 'id' in data) {
    return data as Gym;
  }
  if (Array.isArray((data as GymListResponse).data)) {
    return (data as GymListResponse).data[0];
  }
  throw new Error('Invalid gym API response shape');
}

const GYMS_BASE = '/api/v1/gyms';

export async function fetchGyms(): Promise<Gym[]> {
  const { data } = await apiClient.get<Gym[] | GymListResponse>(GYMS_BASE);
  return unwrapGymList(data);
}

export async function fetchAutoJoinGyms(): Promise<Gym[]> {
  const { data } = await apiClient.get<Gym[] | GymListResponse>(GYMS_BASE, {
    params: { allowAutoJoin: true, page: 1, limit: 20 },
  });
  return unwrapGymList(data);
}

export async function joinGym(gymId: string): Promise<void> {
  await apiClient.post(`${GYMS_BASE}/${gymId}/join`);
}

export async function fetchGymById(id: string): Promise<Gym> {
  const { data } = await apiClient.get<Gym>(`${GYMS_BASE}/${id}`);
  return data;
}

export async function createGym(input: CreateGymInput): Promise<Gym> {
  const { data } = await apiClient.post<Gym | GymListResponse>(GYMS_BASE, input);
  return unwrapGymItem(data);
}

export async function updateGym(input: UpdateGymInput): Promise<Gym> {
  const { id, ...payload } = input;
  const { data } = await apiClient.patch<Gym | GymListResponse>(`${GYMS_BASE}/${id}`, payload);
  return unwrapGymItem(data);
}

export async function deleteGym(id: string): Promise<void> {
  await apiClient.delete(`${GYMS_BASE}/${id}`);
}

