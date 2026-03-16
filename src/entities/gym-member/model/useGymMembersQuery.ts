import { useQuery } from '@tanstack/react-query';

import { fetchGymMembers, gymMemberKeys, type FetchGymMembersOptions } from '../api/gymMemberApi';

type UseGymMembersQueryOptions = FetchGymMembersOptions & {
  gymId: string;
  enabled?: boolean;
};

export function useGymMembersQuery(options: UseGymMembersQueryOptions) {
  const { gymId, enabled = true, roles } = options;
  return useQuery({
    queryKey: gymMemberKeys.list(gymId, roles),
    queryFn: () => fetchGymMembers(gymId, { roles }),
    enabled: !!gymId && enabled,
  });
}

