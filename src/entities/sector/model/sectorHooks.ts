import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchSectorById,
  createSector,
  updateSector,
  deleteSector,
  sectorKeys,
  fetchSectors,
} from '../api/sectorApi';


export function useSectorDetailsQuery(id: string) {
  return useQuery({
    queryKey: sectorKeys.detail(id),
    queryFn: () => fetchSectorById(id),
    enabled: !!id,
  });
}

export function useSectorsQuery(gymId: string) {
  return useQuery({
    queryKey: sectorKeys.list(gymId),
    queryFn: () => fetchSectors(gymId),
  });
}

export function useSectorMutations() {
  const queryClient = useQueryClient();

  const createSectorMutation = useMutation({
    mutationFn: createSector,
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: sectorKeys.lists(data.gymId) }),
  });

  const updateSectorMutation = useMutation({
    mutationFn: updateSector,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sectorKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: sectorKeys.lists(data.gymId) });
    },
  });

  const deleteSectorMutation = useMutation({
    mutationFn: deleteSector,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sectorKeys.all }),
  });

  return { createSectorMutation, updateSectorMutation, deleteSectorMutation };
}
