import * as React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { ascentKeys } from '@/entities/ascent/api/ascentApi';
import { routeKeys } from '@/entities/route/api/routeApi';
import { gymMemberKeys } from '@/entities/gym-member/api/gymMemberApi';
import { statsKeys } from '@/entities/stats/api/statsApi';

export function useHomeRefresh() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ascentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: routeKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: gymMemberKeys.all }),
        queryClient.invalidateQueries({ queryKey: statsKeys.all }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return {
    refreshing,
    onRefresh,
    targets: {
      ascents: ascentKeys.lists(),
      routes: routeKeys.lists(),
    },
  };
}
