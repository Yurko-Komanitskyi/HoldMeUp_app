export interface CreateGymInput {
  name: string;
  address: string;
  description?: string | null;
}

export interface UpdateGymInput {
  id: string;
  name?: string;
  address?: string;
  description?: string | null;
}

