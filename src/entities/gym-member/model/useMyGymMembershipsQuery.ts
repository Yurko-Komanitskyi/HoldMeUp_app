import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchMyGymMemberships, gymMemberKeys } from '../api/gymMemberApi';
import { useGymMemberStore } from './gymMemberStore';

export function useMyGymMembershipsQuery(userId: string | null | undefined) {
  const setMemberships = useGymMemberStore((state) => state.setMemberships);

  const query = useQuery({
    queryKey: [...gymMemberKeys.all, 'me', userId ?? 'none'],
    queryFn: fetchMyGymMemberships,
    enabled: !!userId,
  });

  useEffect(() => {
    if (query.data) {
      setMemberships(query.data);
    }
  }, [query.data, setMemberships]);

  return query;
}
