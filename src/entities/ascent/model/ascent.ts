export type AscentType = string;

export interface Ascent {
  id: string;
  userId: string;
  routeId: string;
  type: AscentType;
  date: Date;
  timeSeconds: number | null;
  attemptNumber: number | null;
  success: boolean;
  gradePerception: string | null;
  feeling: number | null;
  notes: string | null;
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
