import * as React from 'react';

import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useRoutesQuery } from '@/entities/route/model/routeHooks';
import { useAscentsQuery } from '@/entities/ascent/model/ascentHooks';
import { useWeekStats } from '@/entities/ascent/model/useWeekStats';
import { useHomeRefresh } from './useHomeRefresh';

export function useHomeDashboard() {
  const user = useUserStore((s) => s.currentUser);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const memberships = useGymMemberStore((s) => s.memberships);

  const hasGym = memberships.length > 0 || !!currentGymId;

  const { data: { data: ascents = [] } = {}, isLoading: ascentsLoading } = useAscentsQuery();

  const { data: routes = [], isLoading: routesLoading } = useRoutesQuery({
    gymId: currentGymId ?? undefined,
    status: ['ACTIVE'],
  });

  const { refreshing, onRefresh } = useHomeRefresh();

  const weekStats = useWeekStats(ascents);

  return {
    hasGym,
    ascents,
    routes,
    ascentsLoading,
    routesLoading,
    weekStats,
    refreshing,
    onRefresh,
  };
}
