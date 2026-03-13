export interface CreateUserInput {
  email: string;
  password?: string;
  provider?: string;
  socialId?: string | null;
  firstName: string;
  lastName: string;
  photoId?: string | null;
  roleId?: string | null;
  statusId?: string | null;
}

export interface UpdateUserInput {
  id: string;
  email?: string | null;
  password?: string;
  firstName?: string | null;
  lastName?: string | null;
  photoId?: string | null;
  roleId?: string | null;
  statusId?: string | null;
}
