import { resolveRouteColor } from '@/shared/config/palette';

/** Той самий спектр, що й у фільтрі кольорів (кольоровий маршрут). */
export const MULTICOLOR_GRADIENT_COLORS = [
  '#ef4444',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
] as const;

export function isMulticolorRouteColor(color: string | undefined): boolean {
  return (color ?? '').trim().toLowerCase() === 'multicolor';
}

function parseHex(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function darkenHex(hex: string, ratio = 0.22): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb.map((c) => Math.round(c * (1 - ratio)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Кольори градієнта для плитки / верхньої смуги (expo-linear-gradient). */
export function routeAccentGradientStops(
  routeColor: string | undefined
): readonly [string, string, ...string[]] {
  const raw = (routeColor ?? '').trim() || 'grey';
  if (isMulticolorRouteColor(raw)) {
    return [...MULTICOLOR_GRADIENT_COLORS] as readonly [string, string, ...string[]];
  }
  const base = resolveRouteColor(raw);
  return [base, darkenHex(base)] as const;
}

function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0.5;
  const linear = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

/** Колір іконки на суцільному тлі плитки (контраст). Для multicolor — світла іконка. */
export function iconColorOnRouteSwatch(resolvedHex: string): string {
  return relativeLuminance(resolvedHex) > 0.55 ? '#1f2937' : '#ffffff';
}

/** Колір гліфа на плитці картки маршруту (з урахуванням кольорової стрічки). */
export function routeCardGlyphColor(routeColor: string | undefined): string {
  const raw = (routeColor ?? '').trim() || 'grey';
  if (isMulticolorRouteColor(raw)) return '#ffffff';
  return iconColorOnRouteSwatch(resolveRouteColor(raw));
}
