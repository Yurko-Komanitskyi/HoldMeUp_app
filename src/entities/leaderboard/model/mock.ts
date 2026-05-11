import { AscentType } from '@/entities/ascent/model/ascent';
import { calculateScore, type RawAscent } from '../lib/scoring';
import type { LeaderboardEntry, LeaderboardPeriod } from './types';

/* ─── helpers ─────────────────────────────────────────────────── */

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function makeAscents(
  routeBase: number,
  specs: Array<{ grade: string; type: AscentType; daysBack: number }>
): RawAscent[] {
  return specs.map((s, i) => ({
    routeId: `route-${routeBase}-${i}`,
    grade: s.grade,
    type: s.type,
    success: s.type !== AscentType.PROJECT,
    date: daysAgo(s.daysBack),
  }));
}

/* ─── raw ascent pools per mock user ─────────────────────────── */

const USERS_RAW: Array<{
  userId: string;
  firstName: string;
  lastName: string;
  userTag: string;
  isCurrentUser?: boolean;
  ascents: RawAscent[];
}> = [
  {
    userId: 'mock-u1',
    firstName: 'Олексій',
    lastName: 'Коваль',
    userTag: 'oleks_sends',
    ascents: makeAscents(100, [
      { grade: '7b', type: AscentType.FLASH,     daysBack: 2 },
      { grade: '7a+', type: AscentType.REDPOINT, daysBack: 3 },
      { grade: '7a',  type: AscentType.FLASH,    daysBack: 5 },
      { grade: '6c+', type: AscentType.ON_SIGHT, daysBack: 6 },
      { grade: '6c',  type: AscentType.REDPOINT, daysBack: 8 },
      { grade: '7b+', type: AscentType.REDPOINT, daysBack: 12 },
      { grade: '7c',  type: AscentType.PROJECT,  daysBack: 14 },
      { grade: '6b+', type: AscentType.FLASH,    daysBack: 18 },
      { grade: '7a',  type: AscentType.ON_SIGHT, daysBack: 22 },
      { grade: '6c',  type: AscentType.FLASH,    daysBack: 28 },
    ]),
  },
  {
    userId: 'mock-u2',
    firstName: 'Марія',
    lastName: 'Савченко',
    userTag: 'masha_climbs',
    ascents: makeAscents(200, [
      { grade: '7a+', type: AscentType.ON_SIGHT, daysBack: 1 },
      { grade: '7b',  type: AscentType.REDPOINT, daysBack: 4 },
      { grade: '6c+', type: AscentType.FLASH,    daysBack: 5 },
      { grade: '6c',  type: AscentType.ON_SIGHT, daysBack: 7 },
      { grade: '7a',  type: AscentType.REDPOINT, daysBack: 9 },
      { grade: '6b+', type: AscentType.ON_SIGHT, daysBack: 15 },
      { grade: '7a',  type: AscentType.FLASH,    daysBack: 20 },
      { grade: '6c',  type: AscentType.REDPOINT, daysBack: 25 },
    ]),
  },
  {
    userId: 'mock-u3',
    firstName: 'Данило',
    lastName: 'Ткаченко',
    userTag: 'danylo_v3',
    ascents: makeAscents(300, [
      { grade: '7c',  type: AscentType.REDPOINT, daysBack: 3 },
      { grade: '7b+', type: AscentType.FLASH,    daysBack: 5 },
      { grade: '7b',  type: AscentType.ON_SIGHT, daysBack: 8 },
      { grade: '7a+', type: AscentType.FLASH,    daysBack: 10 },
      { grade: '7a',  type: AscentType.REDPOINT, daysBack: 13 },
      { grade: '6c+', type: AscentType.ON_SIGHT, daysBack: 15 },
      { grade: '7c+', type: AscentType.PROJECT,  daysBack: 18 },
      { grade: '6c',  type: AscentType.FLASH,    daysBack: 20 },
      { grade: '7b',  type: AscentType.REDPOINT, daysBack: 23 },
    ]),
  },
  {
    userId: 'mock-u4',
    firstName: 'Ірина',
    lastName: 'Петренко',
    userTag: 'ira_beta',
    ascents: makeAscents(400, [
      { grade: '6b+', type: AscentType.FLASH,    daysBack: 1 },
      { grade: '6c',  type: AscentType.REDPOINT, daysBack: 3 },
      { grade: '6b',  type: AscentType.ON_SIGHT, daysBack: 6 },
      { grade: '6c+', type: AscentType.REDPOINT, daysBack: 10 },
      { grade: '6a+', type: AscentType.FLASH,    daysBack: 12 },
      { grade: '7a',  type: AscentType.TOP,      daysBack: 14 },
      { grade: '6c',  type: AscentType.FLASH,    daysBack: 20 },
    ]),
  },
  {
    userId: 'mock-u5',
    firstName: 'Сергій',
    lastName: 'Мельник',
    userTag: 'serg_dyno',
    ascents: makeAscents(500, [
      { grade: '6c+', type: AscentType.REDPOINT, daysBack: 2 },
      { grade: '6c',  type: AscentType.FLASH,    daysBack: 4 },
      { grade: '7a',  type: AscentType.TOP,      daysBack: 7 },
      { grade: '6b+', type: AscentType.ON_SIGHT, daysBack: 9 },
      { grade: '6c',  type: AscentType.REDPOINT, daysBack: 15 },
      { grade: '6b',  type: AscentType.FLASH,    daysBack: 21 },
    ]),
  },
  {
    userId: 'mock-u6',
    firstName: 'Аня',
    lastName: 'Бондар',
    userTag: 'anya_crimp',
    ascents: makeAscents(600, [
      { grade: '6a',  type: AscentType.ON_SIGHT, daysBack: 1 },
      { grade: '6b',  type: AscentType.FLASH,    daysBack: 3 },
      { grade: '6a+', type: AscentType.REDPOINT, daysBack: 5 },
      { grade: '6b',  type: AscentType.REDPOINT, daysBack: 8 },
      { grade: '5c',  type: AscentType.ON_SIGHT, daysBack: 10 },
    ]),
  },
  {
    userId: 'mock-u7',
    firstName: 'Вова',
    lastName: 'Лисенко',
    userTag: 'vova_heel',
    ascents: makeAscents(700, [
      { grade: '7a+', type: AscentType.REDPOINT, daysBack: 3 },
      { grade: '7a',  type: AscentType.FLASH,    daysBack: 6 },
      { grade: '6c+', type: AscentType.REDPOINT, daysBack: 9 },
      { grade: '6c',  type: AscentType.ON_SIGHT, daysBack: 12 },
      { grade: '7b',  type: AscentType.TOP,      daysBack: 16 },
      { grade: '6b+', type: AscentType.FLASH,    daysBack: 22 },
    ]),
  },
  {
    userId: 'mock-u8',
    firstName: 'Катя',
    lastName: 'Шевченко',
    userTag: 'kate_sloper',
    ascents: makeAscents(800, [
      { grade: '5b',  type: AscentType.FLASH,    daysBack: 2 },
      { grade: '6a',  type: AscentType.REDPOINT, daysBack: 4 },
      { grade: '5c',  type: AscentType.ON_SIGHT, daysBack: 7 },
      { grade: '6a+', type: AscentType.TOP,      daysBack: 11 },
    ]),
  },
];

/* ─── filtering by period ─────────────────────────────────────── */

function filterByPeriod(ascents: RawAscent[], period: LeaderboardPeriod): RawAscent[] {
  if (period === 'all') return ascents;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (period === 'week' ? 7 : 30));
  return ascents.filter((a) => new Date(a.date) >= cutoff);
}

/* ─── public helpers ──────────────────────────────────────────── */

/** IDs that appear in the "following" mock list (friends scope) */
export const MOCK_FOLLOWING_IDS = new Set(['mock-u2', 'mock-u3', 'mock-u5', 'mock-u7']);

/**
 * Build a ranked leaderboard for the given user IDs and period.
 * Pass `currentUserId` to mark the current user's entry.
 */
export function buildMockLeaderboard(
  userIds: string[],
  period: LeaderboardPeriod,
  currentUserId: string
): LeaderboardEntry[] {
  const entries = USERS_RAW.filter((u) => userIds.includes(u.userId)).map((u) => {
    const filtered = filterByPeriod(u.ascents, period);
    return {
      userId: u.userId,
      firstName: u.firstName,
      lastName: u.lastName,
      userTag: u.userTag,
      photoUrl: null,
      isCurrentUser: u.userId === currentUserId,
      score: calculateScore(filtered),
      rank: 0,
    };
  });

  entries.sort((a, b) => b.score.totalPoints - a.score.totalPoints);
  entries.forEach((e, i) => { e.rank = i + 1; });
  return entries;
}

/** All mock user IDs (gym scope) */
export const ALL_GYM_USER_IDS = USERS_RAW.map((u) => u.userId);

/** Info for the custom picker (id + display name) */
export const MOCK_USERS_FOR_PICKER = USERS_RAW.map((u) => ({
  userId: u.userId,
  firstName: u.firstName,
  lastName: u.lastName,
  userTag: u.userTag,
}));
