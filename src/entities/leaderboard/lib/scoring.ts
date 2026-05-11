import { AscentType } from '@/entities/ascent/model/ascent';

/**
 * Exponential points per French grade.
 * Each sub-grade (~+) gives ~25% more, each full grade (~a→b) gives ~35% more.
 * Rationale: 7a feels roughly 5-6× harder than 6a in effort — the curve reflects that.
 */
export const GRADE_POINTS: Record<string, number> = {
  '4':    10,
  '5a':   20,  '5b':   32,  '5c':   48,
  '6a':   68,  '6a+':  90,  '6b':  118,  '6b+':  152,  '6c':  195,  '6c+':  248,
  '7a':  315,  '7a+':  395, '7b':  495,  '7b+':  620,  '7c':  775,  '7c+':  965,
  '8a': 1200,  '8a+': 1490, '8b': 1850,  '8b+': 2300,  '8c': 2850,  '8c+': 3540,
};

/** Bonus multiplier per ascent style — ON_SIGHT is the holy grail */
export const ASCENT_MULTIPLIERS: Record<AscentType, number> = {
  [AscentType.ON_SIGHT]:  1.5,
  [AscentType.FLASH]:     1.3,
  [AscentType.REDPOINT]:  1.0,
  [AscentType.TOP]:       0.6,
  [AscentType.PROJECT]:   0.0,
};

/** Priority order: higher = more valuable (used to pick best ascent per route) */
const TYPE_PRIORITY: Record<AscentType, number> = {
  [AscentType.ON_SIGHT]:  5,
  [AscentType.FLASH]:     4,
  [AscentType.REDPOINT]:  3,
  [AscentType.TOP]:       2,
  [AscentType.PROJECT]:   1,
};

export interface ScoredAscent {
  routeId: string;
  grade: string;
  type: AscentType;
  points: number;
  date: string;
}

export interface LeaderboardScore {
  totalPoints: number;
  uniqueRoutes: number;
  maxGrade: string | null;
  topAscents: ScoredAscent[];
}

/** Raw ascent input — only fields needed for scoring */
export interface RawAscent {
  routeId: string;
  grade: string;
  type: AscentType;
  success: boolean;
  date: string;
}

/**
 * Calculate leaderboard score from a list of ascents.
 * Each unique route counts only once — the best (highest-priority) type wins.
 */
export function calculateScore(ascents: RawAscent[]): LeaderboardScore {
  const bestPerRoute = new Map<string, RawAscent>();

  for (const a of ascents) {
    if (!a.success && a.type !== AscentType.TOP) continue;
    const current = bestPerRoute.get(a.routeId);
    if (!current || TYPE_PRIORITY[a.type] > TYPE_PRIORITY[current.type]) {
      bestPerRoute.set(a.routeId, a);
    }
  }

  const scored: ScoredAscent[] = [];
  let maxGradeIndex = -1;
  let maxGrade: string | null = null;
  const gradeKeys = Object.keys(GRADE_POINTS);

  for (const a of bestPerRoute.values()) {
    const base = GRADE_POINTS[a.grade] ?? 0;
    const multiplier = ASCENT_MULTIPLIERS[a.type] ?? 0;
    const points = Math.round(base * multiplier);
    scored.push({ routeId: a.routeId, grade: a.grade, type: a.type, points, date: a.date });

    const idx = gradeKeys.indexOf(a.grade);
    if (idx > maxGradeIndex) {
      maxGradeIndex = idx;
      maxGrade = a.grade;
    }
  }

  scored.sort((a, b) => b.points - a.points);

  return {
    totalPoints: scored.reduce((s, a) => s + a.points, 0),
    uniqueRoutes: scored.length,
    maxGrade,
    topAscents: scored.slice(0, 5),
  };
}
