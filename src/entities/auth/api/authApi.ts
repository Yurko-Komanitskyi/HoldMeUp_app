import { apiClient, authAxios } from '@/shared/api/axios';
import type { User } from '@/shared/model/types';
import {
  type AuthTokensResponse,
  type AuthUserDto,
  type LoginInput,
  type LoginResult,
  type RegisterInput,
  type UpdateMeInput,
} from './types';

const AUTH_BASE = '/api/v1/auth';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  login: () => [...authKeys.all, 'login'] as const,
  logout: () => [...authKeys.all, 'logout'] as const,
  register: () => [...authKeys.all, 'register'] as const,
  forgotPassword: () => [...authKeys.all, 'forgotPassword'] as const,
  updateMe: () => [...authKeys.all, 'updateMe'] as const,
  deleteMe: () => [...authKeys.all, 'deleteMe'] as const,
};

async function login(input: LoginInput): Promise<LoginResult> {
  const { data } = await authAxios.post<AuthTokensResponse>(`${AUTH_BASE}/email/login`, input);
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    tokenExpires: data.tokenExpires,
    user: data.user,
  };
}

async function logout(): Promise<void> {
  await apiClient.post(`${AUTH_BASE}/logout`);
}

async function getMe(): Promise<User> {
  const { data } = await apiClient.get<AuthUserDto>(`${AUTH_BASE}/me`);
  return data;
}

async function register(input: RegisterInput): Promise<void> {
  await authAxios.post(`${AUTH_BASE}/email/register`, input);
}

async function forgotPassword(email: string): Promise<void> {
  await authAxios.post(`${AUTH_BASE}/forgot/password`, { email });
}

async function updateMe(input: UpdateMeInput): Promise<User> {
  const { data } = await apiClient.patch<AuthUserDto>(`${AUTH_BASE}/me`, input);
  return data;
}

async function deleteMe(): Promise<void> {
  await apiClient.delete(`${AUTH_BASE}/me`);
}

export const authApi = {
  login,
  logout,
  getMe,
  register,
  forgotPassword,
  updateMe,
  deleteMe,
};
