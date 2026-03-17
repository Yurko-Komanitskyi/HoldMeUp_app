import { useMemo, useState } from 'react';
import { Ascent } from '../model/ascent';
import { GRADE_MAP } from './constants';

export function getMaxGradeLabel(ascents: Array<{ route?: { grade?: string } }>): string {
  let max = 0;
  for (const a of ascents) {
    const val = GRADE_MAP[a.route?.grade ?? ''] ?? 0;
    if (val > max) max = val;
  }
  return Object.entries(GRADE_MAP).find(([, v]) => v === max)?.[0] ?? '—';
}

export function useAscentPeriodFilter(ascents: Ascent[]) {
  const [activePeriod, setActivePeriod] = useState<string>('week');
  const periodAscents = useMemo(() => {
    return ascents.filter((a) => a.date.toISOString().slice(0, 7) === activePeriod);
  }, [ascents, activePeriod]);
  return { activePeriod, setActivePeriod, periodAscents };
}
