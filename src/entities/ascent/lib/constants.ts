import { Zap, Eye, Circle, RefreshCw, Frown, Meh, Smile, Flame } from 'lucide-react-native';
import { ACCENT } from '@/shared/config/palette';

export const ASCENT_TYPES = [
  {
    value: 'FLASH',
    label: 'Flash',
    sublabel: 'Першого разу з підказками',
    icon: Zap,
    color: '#eab308',
    bg: 'rgba(234,179,8,0.12)',
  },
  {
    value: 'ONSIGHT',
    label: 'Onsight',
    sublabel: 'Першого разу без підказок',
    icon: Eye,
    color: ACCENT,
    bg: 'rgba(123,173,207,0.12)',
  },
  {
    value: 'REDPOINT',
    label: 'Redpoint',
    sublabel: 'Після спроб — чисто',
    icon: Circle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
  },
  {
    value: 'REPEAT',
    label: 'Repeat',
    sublabel: 'Повторний пролаз',
    icon: RefreshCw,
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.12)',
  },
] as const;

export const FEELINGS = [
  { value: 1, icon: Frown, color: '#ef4444', label: 'Жахливо' },
  { value: 2, icon: Frown, color: '#f97316', label: 'Погано' },
  { value: 3, icon: Meh, color: '#6b7280', label: 'Нормально' },
  { value: 4, icon: Smile, color: '#84cc16', label: 'Добре' },
  { value: 5, icon: Flame, color: '#22c55e', label: 'Супер' },
];
