import type { FileType, Role, Status, User } from '@/shared/model/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleLoginInput {
  idToken: string;
}

export interface RegisterInput {
  email:     string;
  password:  string;
  firstName: string;
  lastName?: string;
}

export interface UpdateMeInput {
  firstName?: string;
  lastName?:  string;
  email?:     string;
  password?:  string;
  oldPassword?: string;
  photo?: { id: string };
  userTag?: string | null;
  openToFollow?: boolean;
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
  photo?: FileType | null;
  userTag?: string | null;
  openToFollow?: boolean;
  role?: Role | null;
  status?: Status;
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