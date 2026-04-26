import type { RouteStyle } from '@/entities/route/model/route';

/** Значення style на бекенді (class-validator enum). */
export type ApiRouteStyle = 'BOULDER' | 'LEAD' | 'TOP_ROPE';

/**
 * Перетворює значення з форми (snake_case) у формат API (UPPER_SNAKE).
 * Для speed API enum не містить — відправляємо BOULDER як найближчий варіант.
 */
export function routeStyleFormToApi(style: RouteStyle | undefined | null): ApiRouteStyle | null {
  if (style == null) return null;
  const map: Record<RouteStyle, ApiRouteStyle> = {
    boulder: 'BOULDER',
    lead: 'LEAD',
    top_rope: 'TOP_ROPE',
    speed: 'BOULDER',
  };
  return map[style] ?? null;
}
