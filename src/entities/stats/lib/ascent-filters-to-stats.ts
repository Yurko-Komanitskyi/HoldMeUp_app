import type { AscentFilters } from '@/entities/ascent/model/ascentHooks';
import type { MyStatsQueryParams } from '../api/statsApi';

const DAY_MS = 86_400_000;

function isDayRangeFilter(filters: AscentFilters): boolean {
  if (!filters.dateFrom || !filters.dateTo) return false;
  const span = new Date(filters.dateTo).getTime() - new Date(filters.dateFrom).getTime();
  return span <= 36 * 60 * 60 * 1000;
}

function listPeriodFromFilters(filters: AscentFilters): 'all' | 'week' | 'month' | 'threeMonths' {
  if (!filters.dateFrom) return 'all';
  const df = new Date(filters.dateFrom).getTime();
  const now = Date.now();
  const diff = now - df;
  if (diff < 8 * DAY_MS) return 'week';
  if (diff < 31 * DAY_MS) return 'month';
  if (diff < 95 * DAY_MS) return 'threeMonths';
  return 'all';
}

export function ascentFiltersToMyStatsParams(filters: AscentFilters): MyStatsQueryParams {
  if (isDayRangeFilter(filters)) {
    return {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      compareWithPrevious: false,
    };
  }
  const p = listPeriodFromFilters(filters);
  if (p === 'all') return { period: 'all', compareWithPrevious: false };
  if (p === 'week') return { period: 'week', compareWithPrevious: true };
  if (p === 'month') return { period: 'month', compareWithPrevious: true };
  // threeMonths — use dateFrom directly since API has no 3-month preset
  return { dateFrom: filters.dateFrom, compareWithPrevious: true };
}
