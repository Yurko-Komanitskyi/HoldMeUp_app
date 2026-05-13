export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

// ─── Condition types ──────────────────────────────────────────────────────────

export interface CountCondition {
  type: 'count';
  metric:
    | 'ascents_total'
    | 'successful_ascents_total'
    | 'ascents_this_week'
    | 'ascents_this_month'
    | 'unique_routes';
  threshold: number;
}

export interface FirstEventCondition {
  type: 'first_event';
  event: 'ascent_logged';
}

export interface GradeReachedCondition {
  type: 'grade_reached';
  min_grade: string;
}

export interface AllCondition {
  type: 'all';
  conditions: AchievementCondition[];
}

export type AchievementCondition =
  | CountCondition
  | FirstEventCondition
  | GradeReachedCondition
  | AllCondition;

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface AchievementDto {
  id: string;
  key: string;
  title: string;
  description: string;
  emoji: string;
  rarity: AchievementRarity;
  condition: AchievementCondition;
  isActive: boolean;
}

export interface UserAchievementDto {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  earnedAt: string | null;
  achievement: AchievementDto;
}
