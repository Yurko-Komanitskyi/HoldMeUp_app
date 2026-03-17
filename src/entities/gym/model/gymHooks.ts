import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGym, deleteGym, fetchAutoJoinGyms, fetchGymById, fetchGyms, gymKeys, joinGym, updateGym } from "../api/gymApi";
import { gymMemberKeys } from "@/entities/gym-member/api/gymMemberApi";

export function useGymsQuery() {
  return useQuery({
    queryKey: gymKeys.lists(),
    queryFn: fetchGyms,
  });
}

export function useAutoJoinGymsQuery() {
  return useQuery({
    queryKey: gymKeys.autoJoin(),
    queryFn: fetchAutoJoinGyms,
  });
}

export function useGymDetailsQuery(id: string) {
  return useQuery({
    queryKey: gymKeys.detail(id),
    queryFn: () => fetchGymById(id),
    enabled: !!id,
  });
}

export function useGymMutations() {
  const queryClient = useQueryClient();

  const createGymMutation = useMutation({
    mutationFn: createGym,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gymKeys.lists() });
    },
  });

  const updateGymMutation = useMutation({
    mutationFn: updateGym,
    onSuccess: (updatedGym) => {
      queryClient.invalidateQueries({ queryKey: gymKeys.detail(updatedGym.id) });
    },
  });

  const deleteGymMutation = useMutation({
    mutationFn: deleteGym,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gymKeys.lists() });
    },
  });

  const joinGymMutation = useMutation({
    mutationFn: joinGym,
    onSuccess: (_data, gymId) => {
      queryClient.invalidateQueries({ queryKey: gymMemberKeys.all });
      queryClient.invalidateQueries({ queryKey: gymKeys.autoJoin() });
    },
  });

  return { createGymMutation, updateGymMutation, deleteGymMutation, joinGymMutation };
}