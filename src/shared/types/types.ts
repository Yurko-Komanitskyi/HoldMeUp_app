export interface FileType {
  id: string;
  path: string;
}

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
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface Gym {
  id: string;
  name: string;
  address: string;
  description: string | null;
  allowAutoJoin?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}
