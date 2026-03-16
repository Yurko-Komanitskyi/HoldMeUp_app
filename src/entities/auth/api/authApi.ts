import { apiClient, authAxios } from '@/shared/api/axios';
import type { User } from '@/entities/user/model/types';
import {
  mapAuthUserDtoToUser,
  type AuthTokensResponse,
  type AuthUserDto,
  type LoginInput,
  type LoginResult,
  type RegisterInput,
  type UpdateMeInput,
} from './types';

const AUTH_BASE = '/api/v1/auth';

/**
 * Логін — через authAxios (без auth interceptors, токен ще не потрібен)
 */
async function login(input: LoginInput): Promise<LoginResult> {
  const { data } = await authAxios.post<AuthTokensResponse>(`${AUTH_BASE}/email/login`, input);
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    tokenExpires: data.tokenExpires,
    user: mapAuthUserDtoToUser(data.user),
  };
}

/**
 * Серверний logout — через apiClient (надсилає access token для blacklist)
 * Не критично якщо не вдасться
 */
async function logout(): Promise<void> {
  await apiClient.post(`${AUTH_BASE}/logout`);
}

/**
 * Отримати поточного юзера — потребує валідного токена
 */
async function getMe(): Promise<User> {
  const { data } = await apiClient.get<AuthUserDto>(`${AUTH_BASE}/me`);
  return mapAuthUserDtoToUser(data);
}

async function register(input: RegisterInput): Promise<void> {
  await authAxios.post(`${AUTH_BASE}/email/register`, input);
}

async function forgotPassword(email: string): Promise<void> {
  await authAxios.post(`${AUTH_BASE}/forgot/password`, { email });
}

async function updateMe(input: UpdateMeInput): Promise<User> {
  const { data } = await apiClient.patch<AuthUserDto>(`${AUTH_BASE}/me`, input);
  return mapAuthUserDtoToUser(data);
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
