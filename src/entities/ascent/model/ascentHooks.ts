import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchAscents,
  fetchAscentById,
  createAscent,
  updateAscent,
  deleteAscent,
  ascentKeys,
} from '../api/ascentApi';

export function useAscentsQuery() {
  return useQuery({
    queryKey: ascentKeys.list(),
    queryFn: fetchAscents,
  });
}

export function useAscentDetailsQuery(id: string) {
  return useQuery({
    queryKey: ascentKeys.detail(id),
    queryFn: () => fetchAscentById(id),
    enabled: !!id,
  });
}

export function useAscentMutations() {
  const queryClient = useQueryClient();

  const createAscentMutation = useMutation({
    mutationFn: createAscent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ascentKeys.lists() }),
  });

  const updateAscentMutation = useMutation({
    mutationFn: updateAscent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ascentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ascentKeys.lists() });
    },
  });

  const deleteAscentMutation = useMutation({
    mutationFn: deleteAscent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ascentKeys.lists() }),
  });

  return { createAscentMutation, updateAscentMutation, deleteAscentMutation };
}
