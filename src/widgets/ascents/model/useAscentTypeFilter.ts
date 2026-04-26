import { useState, useMemo } from 'react';
import type { Ascent } from '@/entities/ascent/model/ascent';

export const ASCENT_FILTERS = [
  { key: 'all', tKey: 'ascents.filter.all' },
  { key: 'FLASH', tKey: 'ascents.filter.FLASH' },
  { key: 'ON_SIGHT', tKey: 'ascents.filter.ON_SIGHT' },
  { key: 'REDPOINT', tKey: 'ascents.filter.REDPOINT' },
  { key: 'TOP', tKey: 'ascents.filter.TOP' },
  { key: 'PROJECT', tKey: 'ascents.filter.PROJECT' },
] as const;

export type AscentFilterKey = (typeof ASCENT_FILTERS)[number]['key'];

export function useAscentTypeFilter(ascents: Ascent[]) {
  const [activeFilter, setActiveFilter] = useState<AscentFilterKey>('all');

  const filteredAscents = useMemo(() => {
    if (activeFilter === 'all') return ascents;
    return ascents.filter((a) => a.type?.toUpperCase() === activeFilter);
  }, [ascents, activeFilter]);

  return { activeFilter, setActiveFilter, filteredAscents };
}
