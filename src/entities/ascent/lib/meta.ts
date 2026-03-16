import { Frown, Flame, Meh, Smile } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export interface AscentTypeMeta {
  color: string;
  bg: string;
  label: string;
}

export const ASCENT_TYPE_META: Record<string, AscentTypeMeta> = {
  FLASH:    { color: '#eab308', bg: 'rgba(234,179,8,0.12)',    label: 'Flash'    },
  ONSIGHT:  { color: '#7badcf', bg: 'rgba(123,173,207,0.12)', label: 'Onsight'  },
  REDPOINT: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Redpoint' },
  REPEAT:   { color: '#6b7280', bg: 'rgba(107,114,128,0.1)',  label: 'Repeat'   },
};

export interface FeelingMeta {
  icon: LucideIcon;
  color: string;
}

export const FEELING_ICONS: Record<number, FeelingMeta> = {
  1: { icon: Frown, color: '#ef4444' },
  2: { icon: Frown, color: '#f97316' },
  3: { icon: Meh,   color: '#6b7280' },
  4: { icon: Smile, color: '#84cc16' },
  5: { icon: Flame, color: '#22c55e' },
};

export const GRADE_MAP: Record<string, number> = {
  '4': 1, '5a': 2, '5b': 3, '5c': 4,
  '6a': 5, '6a+': 6, '6b': 7, '6b+': 8, '6c': 9, '6c+': 10,
  '7a': 11, '7a+': 12, '7b': 13, '7b+': 14, '7c': 15, '7c+': 16,
  '8a': 17, '8a+': 18, '8b': 19, '8b+': 20, '8c': 21, '8c+': 22,
};

export function getMaxGradeLabel(ascents: Array<{ route?: { grade?: string } }>): string {
  let max = 0;
  for (const a of ascents) {
    const val = GRADE_MAP[a.route?.grade ?? ''] ?? 0;
    if (val > max) max = val;
  }
  return Object.entries(GRADE_MAP).find(([, v]) => v === max)?.[0] ?? '—';
}
