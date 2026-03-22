import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchGymMembers,
  fetchMyGymMemberships,
  fetchGymMemberById,
  createGymMember,
  updateGymMember,
  deleteGymMember,
  leaveGym,
  gymMemberKeys,
  type FetchGymMembersOptions,
} from '../api/gymMemberApi';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from './gymMemberStore';
import type { CreateGymMemberInput, UpdateGymMemberInput } from '../api/types';

export function useGymMembersQuery(gymId: string, options?: FetchGymMembersOptions) {
  return useQuery({
    queryKey: gymMemberKeys.list(gymId, options?.roles),
    queryFn: () => fetchGymMembers(gymId, options),
    enabled: !!gymId,
  });
}

export function useMyGymMembershipsQuery() {
  const userId = useUserStore((s) => s.currentUser?.id);
  const query = useQuery({
    queryKey: [...gymMemberKeys.all, 'me'],
    queryFn: fetchMyGymMemberships,
    enabled: !!userId,
  });

  const setMemberships = useGymMemberStore((s) => s.setMemberships);

  useEffect(() => {
    if (query.data) {
      setMemberships(query.data);
    }
  }, [query.data, setMemberships]);

  return query;
}

export function useGymMemberDetailsQuery(gymId: string, memberId: string) {
  return useQuery({
    queryKey: gymMemberKeys.detail(gymId, memberId),
    queryFn: () => fetchGymMemberById(gymId, memberId),
    enabled: !!gymId && !!memberId,
  });
}

export function useGymMemberMutations() {
  const queryClient = useQueryClient();

  const createMemberMutation = useMutation({
    mutationFn: ({ gymId, input }: { gymId: string; input: Omit<CreateGymMemberInput, 'gymId'> }) =>
      createGymMember(gymId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gymMemberKeys.lists(variables.gymId) });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({
      gymId,
      memberId,
      input,
    }: {
      gymId: string;
      memberId: string;
      input: Pick<UpdateGymMemberInput, 'role'>;
    }) => updateGymMember(gymId, memberId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: gymMemberKeys.detail(variables.gymId, variables.memberId),
      });
      queryClient.invalidateQueries({ queryKey: gymMemberKeys.lists(variables.gymId) });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: ({ gymId, memberId }: { gymId: string; memberId: string }) =>
      deleteGymMember(gymId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gymMemberKeys.lists(variables.gymId) });
    },
  });

  const leaveGymMutation = useMutation({
    mutationFn: leaveGym,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gymMemberKeys.all });
    },
  });

  return { createMemberMutation, updateMemberMutation, deleteMemberMutation, leaveGymMutation };
}
