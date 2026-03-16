import { useQuery } from '@tanstack/react-query';

import { fetchAscents, ascentKeys } from '../api/ascentApi';

export function useAscentsQuery(enabled = true) {
  return useQuery({
    queryKey: ascentKeys.list(),
    queryFn: fetchAscents,
    enabled,
  });
}
