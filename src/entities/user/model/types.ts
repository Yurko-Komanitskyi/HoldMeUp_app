import type { FileType } from '@/entities/file/model/types';

export interface Role {
  id: string;
  name: string;
}

export interface Status {
  id: string;
  code: string;
}

export interface User {
  id: string;
  email: string | null;
  provider: string;
  socialId?: string | null;
  firstName: string | null;
  lastName: string | null;
  photo?: FileType | null;
  role?: Role | null;
  status?: Status;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
