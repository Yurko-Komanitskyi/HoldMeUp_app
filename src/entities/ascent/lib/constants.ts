import {
  Zap,
  Eye,
  Circle,
  Target,
  Flag,
  Frown,
  Meh,
  Smile,
  Flame,
  LucideIcon,
} from 'lucide-react-native';
import { ACCENT } from '@/shared/config/palette';

export const ASCENT_TYPES = [
  {
    value: 'FLASH',
    icon: Zap,
    color: '#eab308',
    bg: 'rgba(234,179,8,0.12)',
  },
  {
    value: 'ON_SIGHT',
    icon: Eye,
    color: ACCENT,
    bg: 'rgba(123,173,207,0.12)',
  },
  {
    value: 'REDPOINT',
    icon: Circle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
  },
  {
    value: 'TOP',
    icon: Target,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
  },
  {
    value: 'PROJECT',
    icon: Flag,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
  },
] as const;

export const FEELINGS = [
  { value: 1, icon: Frown, color: '#ef4444' },
  { value: 2, icon: Frown, color: '#f97316' },
  { value: 3, icon: Meh, color: '#6b7280' },
  { value: 4, icon: Smile, color: '#84cc16' },
  { value: 5, icon: Flame, color: '#22c55e' },
];

export interface AscentTypeMeta {
  color: string;
  bg: string;
}

/** Ключі для logAscent.ascentTypeLabel.* та ASCENT_TYPE_META. */
export type AscentTypeMetaKey = 'FLASH' | 'ONSIGHT' | 'REDPOINT' | 'TOP' | 'PROJECT';

/** Зводить тип з API до ключа метаданих (ONSIGHT / ON_SIGHT → ONSIGHT). */
export function normalizeAscentTypeMetaKey(type: string | undefined | null): AscentTypeMetaKey {
  const u = (type ?? '').toUpperCase().replace(/-/g, '_');
  if (u === 'ON_SIGHT' || u === 'ONSIGHT') return 'ONSIGHT';
  if (u === 'FLASH') return 'FLASH';
  if (u === 'REDPOINT') return 'REDPOINT';
  if (u === 'TOP') return 'TOP';
  if (u === 'PROJECT') return 'PROJECT';
  return 'REDPOINT';
}

export const ASCENT_TYPE_META: Record<AscentTypeMetaKey, AscentTypeMeta> = {
  FLASH: { color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  ONSIGHT: { color: '#7badcf', bg: 'rgba(123,173,207,0.12)' },
  REDPOINT: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  TOP: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  PROJECT: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
};

export interface FeelingMeta {
  icon: LucideIcon;
  color: string;
}

export const FEELING_ICONS: Record<number, FeelingMeta> = {
  1: { icon: Frown, color: '#ef4444' },
  2: { icon: Frown, color: '#f97316' },
  3: { icon: Meh, color: '#6b7280' },
  4: { icon: Smile, color: '#84cc16' },
  5: { icon: Flame, color: '#22c55e' },
};

export const GRADE_MAP: Record<string, number> = {
  '4': 1,
  '5a': 2,
  '5b': 3,
  '5c': 4,
  '6a': 5,
  '6a+': 6,
  '6b': 7,
  '6b+': 8,
  '6c': 9,
  '6c+': 10,
  '7a': 11,
  '7a+': 12,
  '7b': 13,
  '7b+': 14,
  '7c': 15,
  '7c+': 16,
  '8a': 17,
  '8a+': 18,
  '8b': 19,
  '8b+': 20,
  '8c': 21,
  '8c+': 22,
};
