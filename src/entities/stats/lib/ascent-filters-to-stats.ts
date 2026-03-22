import type { AscentFilters } from '@/entities/ascent/model/ascentHooks';
import type { MyStatsQueryParams } from '../api/statsApi';

function listPeriodFromFilters(filters: AscentFilters): 'all' | 'week' | 'month' {
  if (!filters.dateFrom) return 'all';
  const df = new Date(filters.dateFrom).getTime();
  const now = Date.now();
  const diff = now - df;
  const DAY = 86_400_000;
  if (diff < 8 * DAY) return 'week';
  if (diff < 31 * DAY) return 'month';
  return 'all';
}

export function ascentFiltersToMyStatsParams(filters: AscentFilters): MyStatsQueryParams {
  const p = listPeriodFromFilters(filters);
  if (p === 'all') return { period: 'all', compareWithPrevious: false };
  if (p === 'week') return { period: 'week', compareWithPrevious: false };
  return { period: 'month', compareWithPrevious: false };
}
