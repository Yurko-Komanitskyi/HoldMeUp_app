export enum AscentType {
  FLASH = 'FLASH',
  REDPOINT = 'REDPOINT',
  TOP = 'TOP',
  PROJECT = 'PROJECT',
  ON_SIGHT = 'ON_SIGHT',
}

export type AscentFeedLocalizedField = string | Record<string, string> | null;

export interface AscentReaction {
  id: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Ascent {
  id: string;
  userId: string;
  routeId: string;
  routeName?: string;
  routeGrade?: string;
  routeColor?: string;
  type: AscentType;
  date: string;
  timeSeconds: number | null;
  attemptNumber: number | null;
  success: boolean;
  gradePerception: string | null;
  feeling: number | null;
  notes: string | null;
  videoUrl: string | null;
  reactions?: AscentReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface AscentFeedItem {
  id: string;
  userId: string;
  routeId: string;
  routeName?: AscentFeedLocalizedField;
  routeGrade?: AscentFeedLocalizedField;
  routeColor?: AscentFeedLocalizedField;
  type: AscentType;
  date: string;
  timeSeconds: AscentFeedLocalizedField;
  attemptNumber: AscentFeedLocalizedField;
  success: boolean;
  gradePerception: AscentFeedLocalizedField;
  feeling: AscentFeedLocalizedField;
  notes: AscentFeedLocalizedField;
  videoUrl: AscentFeedLocalizedField;
  reactions: AscentReaction[];
  createdAt: string;
  updatedAt: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  userTag?: string | null;
}
