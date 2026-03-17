import { GRADE_MAP } from '@/entities/ascent/lib/meta';
import type { Ascent } from '@/entities/ascent/model/ascent';

export function computeAscentsStats(ascents: Ascent[]) {
  const total = ascents.length;
  const success = ascents.filter((a) => a.success).length;
  const flash = ascents.filter((a) => a.type?.toUpperCase() === 'FLASH').length;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
  const maxGradeVal = ascents.reduce((max, a) => {
    const val = GRADE_MAP[(a as any).route?.grade ?? ''] ?? 0;
    return val > max ? val : max;
  }, 0);
  const maxGradeLabel = Object.entries(GRADE_MAP).find(([, v]) => v === maxGradeVal)?.[0] ?? '—';
  return { total, success, flash, successRate, maxGradeLabel };
}
