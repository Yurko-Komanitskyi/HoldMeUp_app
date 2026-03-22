import type { Route } from '@/entities/route/model/route';

export function formatRouteSetterName(setter?: Route['setter']): string {
  if (!setter) return 'Unknown';
  const parts = [setter.firstName, setter.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Unknown';
}
