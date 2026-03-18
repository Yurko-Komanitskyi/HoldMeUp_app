export enum AscentType {
  FLASH = 'FLASH',
  REDPOINT = 'REDPOINT',
  TOP = 'TOP',
  PROJECT = 'PROJECT',
  ON_SIGHT = 'ON_SIGHT',
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
  createdAt: string;
  updatedAt: string;
}
