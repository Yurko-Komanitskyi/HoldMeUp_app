export interface CreateSectorInput {
  gymId: string;
  name: string;
  description?: string | null;
}

export interface UpdateSectorInput {
  id: string;
  gymId?: string;
  name?: string;
  description?: string | null;
}

