import type { User } from '@/entities/user/model/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokensResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: AuthUserDto;
}

export interface AuthUserDto {
  id: string;
  email: string | null;
  provider: string;
  socialId?: string | null;
  firstName: string | null;
  lastName: string | null;
  photo?: { id: string; path: string } | null;
  role?: { id: number; name: string } | null;
  status?: { id: number; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: User;
}

export interface RefreshResult {
  token: string;
  refreshToken: string;
  tokenExpires: number;
}

export function mapAuthUserDtoToUser(dto: AuthUserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    provider: dto.provider,
    socialId: dto.socialId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    photo: dto.photo ? { id: dto.photo.id, path: dto.photo.path } : null,
    role: dto.role ? { id: String(dto.role.id), name: dto.role.name } : null,
    status: dto.status ? { id: String(dto.status.id), code: dto.status.name } : undefined,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    deletedAt: new Date(dto.deletedAt),
  };
}
