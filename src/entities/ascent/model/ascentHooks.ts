import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchAscents,
  fetchAscentById,
  createAscent,
  updateAscent,
  deleteAscent,
  ascentKeys,
} from '../api/ascentApi';
import { statsKeys } from '@/entities/stats/api/statsApi';
import { AscentType } from './ascent';
import { useInfiniteListQuery } from '@/shared/hooks/useInfiniteListQuery';

const ASCENTS_PAGE_SIZE = 20;

export interface AscentFilters {
  type?: AscentType;
  routeId?: string;
  success?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export function useAscentsQuery(filters?: AscentFilters) {
  return useInfiniteListQuery({
    queryKey: ascentKeys.list(),
    fetchFn: fetchAscents,
    params: filters,
    pageSize: ASCENTS_PAGE_SIZE,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ascentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });

  const updateAscentMutation = useMutation({
    mutationFn: updateAscent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ascentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ascentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });

  const deleteAscentMutation = useMutation({
    mutationFn: deleteAscent,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ascentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ascentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });

  return { createAscentMutation, updateAscentMutation, deleteAscentMutation };
}
