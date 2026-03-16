export type RouteStatus = 'active' | 'archived' | 'draft';
export type RouteStyle = 'boulder' | 'lead' | 'top_rope' | 'speed';
export type HoldType =
  | 'crimp'
  | 'sloper'
  | 'jug'
  | 'pinch'
  | 'pocket'
  | 'volume'
  | 'undercling'
  | 'sidepull';

export interface Route {
  id: string;
  sectorId: string;
  sector?: { id: string; name: string };
  setterId?: string;
  setter?: { id: string; firstName: string | null; lastName: string | null };
  name: string;
  grade: string;
  color: string;
  description?: string | null;
  style?: RouteStyle | string | null;
  height?: number | null;
  status: RouteStatus | string;
  photoUrl?: string | null;
  holdTypes?: HoldType[] | string[];
  tags?: string[];
  annotationData?: string | null;
  ascentCount?: number;
  flashCount?: number;
  communityRating?: number;
  createdAt: Date;
  updatedAt: Date;
}
