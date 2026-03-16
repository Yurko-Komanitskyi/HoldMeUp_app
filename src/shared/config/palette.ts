export const ACCENT = '#7badcf';

export const ROUTE_COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  violet: '#8b5cf6',
  pink: '#ec4899',
  black: '#374151',
  white: '#e5e7eb',
  grey: '#6b7280',
  gray: '#6b7280',
  brown: '#92400e',
  teal: '#14b8a6',
  multicolor: '#f97316',
};

export function resolveRouteColor(color: string): string {
  return ROUTE_COLOR_MAP[color?.toLowerCase()] ?? color ?? '#6b7280';
}
