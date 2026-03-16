import { useQuery } from '@tanstack/react-query';

import { fetchSectors, sectorKeys } from '../api/sectorApi';

export function useSectorsQuery(gymId: string | null, enabled = true) {
  return useQuery({
    queryKey: sectorKeys.list(gymId ?? ''),
    queryFn: () => fetchSectors(gymId!),
    enabled: !!gymId && enabled,
  });
}
