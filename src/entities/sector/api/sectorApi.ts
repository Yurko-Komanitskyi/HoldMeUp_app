import { apiClient } from '@/shared/api/axios';

import type { Sector } from '../model/sector';
import type { CreateSectorInput, UpdateSectorInput } from './types';

const SECTORS_BASE = '/api/v1/sectors';

export const sectorKeys = {
  all: ['sectors'] as const,
  lists: (gymId: string) => [...sectorKeys.all, 'list', gymId] as const,
  list: (gymId: string) => [...sectorKeys.lists(gymId)] as const,
  details: () => [...sectorKeys.all, 'detail'] as const,
  detail: (id: string) => [...sectorKeys.details(), id] as const,
};

export async function fetchSectors(gymId: string): Promise<Sector[]> {
  const { data } = await apiClient.get<Sector[]>(`${SECTORS_BASE}/by-gym/${gymId}`);
  return Array.isArray(data) ? data : [];
}

export async function fetchSectorById(id: string): Promise<Sector> {
  const { data } = await apiClient.get<Sector>(`${SECTORS_BASE}/${id}`);
  return data;
}

export async function createSector(input: CreateSectorInput): Promise<Sector> {
  const { data } = await apiClient.post<Sector>(SECTORS_BASE, input);
  return data;
}

export async function updateSector(input: UpdateSectorInput): Promise<Sector> {
  const { id, ...payload } = input;
  const { data } = await apiClient.patch<Sector>(`${SECTORS_BASE}/${id}`, payload);
  return data;
}

export async function deleteSector(id: string): Promise<void> {
  await apiClient.delete(`${SECTORS_BASE}/${id}`);
}

