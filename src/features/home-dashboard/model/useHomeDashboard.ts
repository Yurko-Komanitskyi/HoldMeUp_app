import * as React from 'react';

import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useRoutesQuery } from '@/entities/route/model/routeHooks';
import { useAscentsQuery } from '@/entities/ascent/model/ascentHooks';
import { useWeekStats } from '@/entities/ascent/model/useWeekStats';

export function useHomeDashboard() {
  const user = useUserStore((s) => s.currentUser);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const memberships = useGymMemberStore((s) => s.memberships);

  const hasGym = memberships.length > 0 || !!currentGymId;

  const [refreshing, setRefreshing] = React.useState(false);

  const {
    data: ascents = [],
    isLoading: ascentsLoading,
    refetch,
  } = useAscentsQuery();

  const {
    data: routes = [],
    isLoading: routesLoading,
  } = useRoutesQuery({ gymId: currentGymId ?? undefined, status: ['ACTIVE'] });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

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

