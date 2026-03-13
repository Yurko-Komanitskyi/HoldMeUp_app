import { apiClient } from '@/shared/api/axios';
import type { User } from '../model/types';
import type { CreateUserInput, UpdateUserInput } from './types';

const USERS_BASE = '/api/v1/users';

export const userKeys = {
  all: ['users'] as const,
  lists: (filters?: UserListFilters) => [...userKeys.all, 'list', filters ?? {}] as const,
  list: (filters?: UserListFilters) => [...userKeys.lists(filters)] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  roles: () => [...userKeys.all, 'options', 'roles'] as const,
  statuses: () => [...userKeys.all, 'options', 'statuses'] as const,
};

export type UserListFilters = {
  search?: string;
};

export type RoleOption = { id: string; name?: string };
export type StatusOption = { id: string; name?: string; code?: string };

type UsersListResponse = { data: User[]; hasNextPage?: boolean };

export async function fetchUsers(filters?: UserListFilters): Promise<User[]> {
  const params: Record<string, string> = {};
  if (filters && Object.keys(filters).length > 0) {
    params.filters = JSON.stringify(filters);
  }
  const { data } = await apiClient.get<User[] | UsersListResponse>(USERS_BASE, {
    params,
  });
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as UsersListResponse).data)
  ) {
    return (data as UsersListResponse).data;
  }
  return [];
}

export async function fetchUserById(id: string): Promise<User> {
  const { data } = await apiClient.get<User>(`${USERS_BASE}/${id}`);
  return data;
}

export async function fetchRoles(): Promise<RoleOption[]> {
  const { data } = await apiClient.get<RoleOption[]>(`${USERS_BASE}/options/roles`);
  return Array.isArray(data) ? data : [];
}

export async function fetchStatuses(): Promise<StatusOption[]> {
  const { data } = await apiClient.get<StatusOption[]>(`${USERS_BASE}/options/statuses`);
  return Array.isArray(data) ? data : [];
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data } = await apiClient.post<User>(USERS_BASE, input);
  return data;
}

export async function updateUser(input: UpdateUserInput): Promise<User> {
  const { id, ...payload } = input;
  const { data } = await apiClient.patch<User>(`${USERS_BASE}/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`${USERS_BASE}/${id}`);
}
