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
      const keys = [
        ascentKeys.lists(),
        ascentKeys.feeds(),
        routeKeys.lists(),
        gymMemberKeys.all,
        statsKeys.all,
      ] as const;

      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      await Promise.all(
        keys.map((queryKey) => queryClient.refetchQueries({ queryKey, type: 'active' }))
      );
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
