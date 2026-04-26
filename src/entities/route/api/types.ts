export interface CreateRouteInput {
  sectorId: string;
  setterId: string;
  name: string;
  grade: string;
  color: string;
  description?: string | null;
  style?: string | null;
  height?: number | null;
  status: string;
  photoUrl?: string | null;
  holdTypes?: string[];
  tags?: string[];
  annotation?: string | null;
  annotationData?: string | null;
}

export interface UpdateRouteInput {
  id: string;
  sectorId?: string;
  setterId?: string;
  name?: string;
  grade?: string;
  color?: string;
  description?: string | null;
  style?: string | null;
  height?: number | null;
  status?: string;
  photoUrl?: string | null;
  holdTypes?: string[];
  tags?: string[];
  annotation?: string | null;
  annotationData?: string | null;
}

export interface RouteListFilters {
  page?: number;
  limit?: number;
  gymId?: string;
  sectorId?: string;
  grade?: string[];
  status?: string[];
  style?: string[];
  setterId?: string;
  color?: string;
  search?: string;
}

