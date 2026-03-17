import { useMemo } from 'react';
import type { Ascent } from './ascent';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useWeekStats(ascents: Ascent[]) {
  return useMemo(() => {
    const cutoff = new Date(Date.now() - ONE_WEEK_MS);
    const week = ascents.filter((a) => new Date(a.date) >= cutoff);
    return {
      total: week.length,
      success: week.filter((a) => a.success).length,
      flash: week.filter((a) => a.type?.toUpperCase() === 'FLASH').length,
    };
  }, [ascents]);
}
