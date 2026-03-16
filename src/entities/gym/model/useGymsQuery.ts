import { useQuery } from '@tanstack/react-query';

import { fetchGyms, gymKeys } from '../api/gymApi';

export type UseGymsQueryOptions = {
  enabled?: boolean;
};

export function useGymsQuery(options: UseGymsQueryOptions = {}) {
  return useQuery({
    queryKey: gymKeys.list(),
    queryFn: fetchGyms,
    enabled: options.enabled ?? true,
  });
}

