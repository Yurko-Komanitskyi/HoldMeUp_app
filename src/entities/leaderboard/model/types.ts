import type { LeaderboardScore } from '../lib/scoring';

export type LeaderboardScope = 'gym' | 'friends' | 'custom';
export type LeaderboardPeriod = 'week' | 'month' | 'all';

export interface LeaderboardEntry {
  userId: string;
  rank: number;
  firstName: string | null;
  lastName: string | null;
  userTag: string | null;
  photoUrl?: string | null;
  isCurrentUser: boolean;
  score: LeaderboardScore;
}
