import { Sector } from "@/entities/sector/model/sector";
import { User } from "@/entities/user/model/user";

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
  sector: Sector;
  setter: User;
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
  annotation?: string | null;
  annotationData?: string | null;
  ascentCount?: number;
  flashCount?: number;
  communityRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum RouteGrade {
  _5A = '5a',
  _5B = '5b',
  _5C = '5c',
  _6A = '6a',
  _6A_PLUS = '6a+',
  _6B = '6b',
  _6B_PLUS = '6b+',
  _6C = '6c',
  _6C_PLUS = '6c+',
  _7A = '7a',
  _7A_PLUS = '7a+',
  _7B = '7b',
  _7B_PLUS = '7b+',
  _7C = '7c',
  _7C_PLUS = '7c+',
  _8A = '8a',
  _8A_PLUS = '8a+',
  _8B = '8b',
  _8B_PLUS = '8b+',
  _8C = '8c',
  _8C_PLUS = '8c+',
  _9A = '9a',
  _9A_PLUS = '9a+',
  _9B = '9b',
  _9B_PLUS = '9b+',
  _9C = '9c',
}
