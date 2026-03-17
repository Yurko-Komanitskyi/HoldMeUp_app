import * as React from 'react';

import { useAutoJoinGymsQuery, useGymMutations } from '@/entities/gym/model/gymHooks';
import { useGymMemberMutations } from '@/entities/gym-member/model/gymMemberHooks';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';

export function useGymManage() {
  const memberships = useGymMemberStore((s) => s.memberships);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const setCurrentGymId = useGymMemberStore((s) => s.setCurrentGymId);

  const memberGymIds = React.useMemo(() => new Set(memberships.map((m) => m.gym.id)), [memberships]);

  const [leavingId, setLeavingId] = React.useState<string | null>(null);
  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(new Set());
  const [joinErrors, setJoinErrors] = React.useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = React.useState(false);

  const { leaveGymMutation } = useGymMemberMutations();
  const { joinGymMutation } = useGymMutations();

  const {
    data: autoJoinGyms = [],
    isLoading: gymsLoading,
    refetch,
  } = useAutoJoinGymsQuery();

  const availableGyms = React.useMemo(
    () => autoJoinGyms.filter((g) => !memberGymIds.has(g.id) && !joinedIds.has(g.id)),
    [autoJoinGyms, memberGymIds, joinedIds]
  );

  async function leaveGym(gymId: string) {
    setLeavingId(gymId);
    try {
      await leaveGymMutation.mutateAsync(gymId);
      const updatedMemberships = useGymMemberStore.getState().memberships;
      const remaining = updatedMemberships.filter((m) => m.gym.id !== gymId);
      if (currentGymId === gymId) {
        const nextGymId = remaining.length > 0 ? remaining[0].gym.id : null;
        setCurrentGymId(nextGymId);
      }
      return remaining.length;
    } finally {
      setLeavingId(null);
    }
  }

  async function joinGym(gymId: string) {
    setJoiningId(gymId);
    setJoinErrors((prev) => {
      const n = { ...prev };
      delete n[gymId];
      return n;
    });
    try {
      await joinGymMutation.mutateAsync(gymId);
      setJoinedIds((prev) => new Set([...prev, gymId]));
      if (!currentGymId) setCurrentGymId(gymId);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Не вдалося приєднатися до залу';
      setJoinErrors((prev) => ({ ...prev, [gymId]: message }));
      throw e;
    } finally {
      setJoiningId(null);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  return {
    // data
    memberships,
    currentGymId,
    availableGyms,
    gymsLoading,
    // ui state
    leavingId,
    joiningId,
    joinedIds,
    joinErrors,
    refreshing,
    // actions
    leaveGym,
    joinGym,
    onRefresh,
  };
}

