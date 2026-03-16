import { apiClient } from '@/shared/api/axios';

import { GymMemberRole, type GymMember } from '../model/gym-member';
import type { CreateGymMemberInput, UpdateGymMemberInput } from './types';

const GYMS_BASE = '/api/v1/gyms';
const MY_MEMBERS_URL = `${GYMS_BASE}/members/me`;

export const gymMemberKeys = {
  all: ['gyms', 'members'] as const,
  lists: (gymId: string, roles?: string[]) =>
    [...gymMemberKeys.all, gymId, ...(roles ?? [])] as const,
  list: (gymId: string, roles?: string[]) => [...gymMemberKeys.lists(gymId, roles)] as const,
  details: (gymId: string) => [...gymMemberKeys.all, gymId, 'detail'] as const,
  detail: (gymId: string, memberId: string) => [...gymMemberKeys.details(gymId), memberId] as const,
};

function membersUrl(gymId: string, memberId?: string) {
  const base = `${GYMS_BASE}/${gymId}/members`;
  return memberId ? `${base}/${memberId}` : base;
}

export type FetchGymMembersOptions = {
  roles?: string[];
};

export async function fetchGymMembers(
  gymId: string,
  options?: FetchGymMembersOptions
): Promise<GymMember[]> {
  const params: Record<string, string | string[]> = {};
  if (options?.roles?.length) {
    if (options.roles.length === 1 && options.roles[0] === GymMemberRole.CUSTOMER) {
      params.role = options.roles[0];
    } else {
      params.roles = options.roles;
    }
  }
  const { data } = await apiClient.get<GymMember[]>(membersUrl(gymId), {
    params,
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchMyGymMemberships(): Promise<GymMember[]> {
  const { data } = await apiClient.get<GymMember[]>(MY_MEMBERS_URL);
  return Array.isArray(data) ? data : [];
}

export async function fetchGymMemberById(gymId: string, memberId: string): Promise<GymMember> {
  const { data } = await apiClient.get<GymMember>(membersUrl(gymId, memberId));
  return data;
}

export async function createGymMember(
  gymId: string,
  input: Omit<CreateGymMemberInput, 'gymId'>
): Promise<GymMember> {
  const id = String(gymId).trim();
  const { data } = await apiClient.post<GymMember>(membersUrl(id), {
    gymId: id,
    userId: String(input.userId).trim(),
    role: input.role,
  });
  return data;
}

export async function updateGymMember(
  gymId: string,
  memberId: string,
  input: Pick<UpdateGymMemberInput, 'role'>
): Promise<GymMember> {
  const { data } = await apiClient.patch<GymMember>(membersUrl(gymId, memberId), input);
  return data;
}

export async function deleteGymMember(gymId: string, memberId: string): Promise<void> {
  await apiClient.delete(membersUrl(gymId, memberId));
}

export async function leaveGym(gymId: string): Promise<void> {
  await apiClient.delete(`${GYMS_BASE}/${gymId}/members/me`);
}
