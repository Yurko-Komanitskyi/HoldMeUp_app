import { apiClient } from '@/shared/api/axios';
import type { User } from '@/entities/user/model/types';
import {
  mapAuthUserDtoToUser,
  RefreshResult,
  type AuthTokensResponse,
  type AuthUserDto,
  type LoginInput,
  type LoginResult,
} from './types';

const AUTH_BASE = '/api/v1/auth';

async function login(input: LoginInput): Promise<LoginResult> {
  const { data } = await apiClient.post<AuthTokensResponse>(`${AUTH_BASE}/email/login`, input);

  return {
    token: data.token,
    refreshToken: data.refreshToken,
    tokenExpires: data.tokenExpires,
    user: mapAuthUserDtoToUser(data.user),
  };
}

async function refresh(refreshToken: string): Promise<RefreshResult> {
  const { data } = await apiClient.post<AuthTokensResponse>(`${AUTH_BASE}/refresh`, undefined, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    tokenExpires: data.tokenExpires,
  };
}

async function logout(): Promise<void> {
  await apiClient.post(`${AUTH_BASE}/logout`);
}

async function getMe(): Promise<User> {
  const { data } = await apiClient.get<AuthUserDto>(`${AUTH_BASE}/me`);
  return mapAuthUserDtoToUser(data);
}

export const authApi = {
  login,
  refresh,
  logout,
  getMe,
};
