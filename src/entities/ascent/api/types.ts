import type { AscentType } from '../model/ascent';
import type { BaseListParams } from '@/shared/types/pagination';

export type AscentFeedParams = BaseListParams & {
  dateFrom?: string;
  dateTo?: string;
  type?: AscentType;
  routeId?: string;
  success?: boolean;
};

export interface AddAscentReactionInput {
  emoji: string;
}

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

