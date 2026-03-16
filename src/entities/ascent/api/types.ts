export interface CreateAscentInput {
  userId: string;
  routeId: string;
  type: string;
  date: string;
  timeSeconds?: number | null;
  attemptNumber?: number | null;
  success: boolean;
  gradePerception?: string | null;
  feeling?: number | null;
  notes?: string | null;
  videoUrl?: string | null;
}

export interface UpdateAscentInput {
  id: string;
  userId?: string;
  routeId?: string;
  type?: string;
  date?: string;
  timeSeconds?: number | null;
  attemptNumber?: number | null;
  success?: boolean;
  gradePerception?: string | null;
  feeling?: number | null;
  notes?: string | null;
  videoUrl?: string | null;
}

