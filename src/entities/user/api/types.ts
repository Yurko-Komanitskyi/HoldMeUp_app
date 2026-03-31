export interface CreateUserInput {
  email: string;
  password?: string;
  provider?: string;
  socialId?: string | null;
  firstName: string;
  lastName: string;
  photoId?: string | null;
  userTag?: string | null;
  openToFollow?: boolean;
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
  userTag?: string | null;
  openToFollow?: boolean;
  roleId?: string | null;
  statusId?: string | null;
}
