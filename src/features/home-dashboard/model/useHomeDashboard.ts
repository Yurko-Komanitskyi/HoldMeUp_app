import * as React from 'react';

import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useRoutesQuery } from '@/entities/route/model/routeHooks';
import { useAscentsQuery } from '@/entities/ascent/model/ascentHooks';
import { AscentType } from '@/entities/ascent/model/ascent';
import { useMyStatsQuery } from '@/entities/stats/model/statsHooks';
import { useHomeRefresh } from './useHomeRefresh';

export function useHomeDashboard() {
  const user = useUserStore((s) => s.currentUser);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const memberships = useGymMemberStore((s) => s.memberships);

  const hasGym = memberships.length > 0 || !!currentGymId;

  const ascentsQuery = useAscentsQuery();

  const weekStatsQuery = useMyStatsQuery(
    {
      period: 'week',
      gymId: currentGymId ?? undefined,
      compareWithPrevious: false,
    },
    { enabled: !!user }
  );
  const { data: weekStatsData, isLoading: weekStatsLoading } = weekStatsQuery;

  const weekStats = React.useMemo(() => {
    const c = weekStatsData?.current;
    return {
      total: c?.totalAscents ?? 0,
      success: c?.successfulAscents ?? 0,
      flash: c?.byType?.[AscentType.FLASH] ?? 0,
    };
  }, [weekStatsData]);

  const routesQuery = useRoutesQuery({
    gymId: currentGymId ?? undefined,
    status: ['ACTIVE'],
  });
  const { items: routes, isLoading: routesLoading } = routesQuery;

  const { refreshing, onRefresh } = useHomeRefresh();

  return {
    hasGym,
    ascents: ascentsQuery.items,
    routes,
    ascentsLoading: ascentsQuery.isLoading,
    ascentsError: ascentsQuery.isError,
    ascentsQueryError: ascentsQuery.error,
    refetchAscents: ascentsQuery.refetch,
    routesLoading,
    routesError: routesQuery.isError,
    routesQueryError: routesQuery.error,
    refetchRoutes: routesQuery.refetch,
    weekStats,
    weekStatsLoading,
    weekStatsError: weekStatsQuery.isError,
    weekStatsQueryError: weekStatsQuery.error,
    refetchWeekStats: weekStatsQuery.refetch,
    refreshing,
    onRefresh,
  };
}
