import type { LucideIcon } from 'lucide-react-native';
import { Lock, Mountain, Route as RouteGlyph, Zap } from 'lucide-react-native';

import i18n from '@/shared/lib/i18n';

/** Нормалізує ключ стилю з API (TOP_ROPE, top-rope → top_rope). */
export function normalizeRouteStyleKey(style: string): string {
  return style.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function humanizeStyleKey(key: string): string {
  return key
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Підпис стилю для картки; невідомі значення показуємо як читабельний рядок. */
export function getRouteStyleLabel(style: string | null | undefined): string | null {
  if (style == null || style.trim() === '') return null;
  const key = normalizeRouteStyleKey(style);
  const path = `routes.styleKeys.${key}`;
  const translated = i18n.t(path);
  if (translated === path) return humanizeStyleKey(key);
  return translated;
}

const STYLE_ICONS: Record<string, LucideIcon> = {
  boulder: Mountain,
  lead: RouteGlyph,
  top_rope: Lock,
  speed: Zap,
};

export function getRouteStyleIcon(normalizedKey: string): LucideIcon {
  return STYLE_ICONS[normalizedKey] ?? Mountain;
}
