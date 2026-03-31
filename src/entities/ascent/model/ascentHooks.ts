import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchAscents,
  fetchAscentById,
  fetchAscentFeed,
  addAscentReaction,
  deleteAscentReaction,
  createAscent,
  updateAscent,
  deleteAscent,
  ascentKeys,
} from '../api/ascentApi';
import type { AscentFeedParams } from '../api/types';
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
  userId?: string;
}

export function useAscentsQuery(
  filters?: AscentFilters,
  options?: { enabled?: boolean }
) {
  return useInfiniteListQuery({
    queryKey: ascentKeys.list(),
    fetchFn: fetchAscents,
    params: filters,
    pageSize: ASCENTS_PAGE_SIZE,
    enabled: options?.enabled ?? true,
  });
}

export function useAscentFeedQuery(
  filters?: Omit<AscentFeedParams, 'page' | 'limit'>,
  options?: { enabled?: boolean }
) {
  return useInfiniteListQuery({
    queryKey: ascentKeys.feed(filters),
    fetchFn: fetchAscentFeed,
    params: filters,
    pageSize: ASCENTS_PAGE_SIZE,
    enabled: options?.enabled ?? true,
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
      queryClient.invalidateQueries({ queryKey: ascentKeys.feeds() });
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });

  const updateAscentMutation = useMutation({
    mutationFn: updateAscent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ascentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ascentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ascentKeys.feeds() });
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });

  const deleteAscentMutation = useMutation({
    mutationFn: deleteAscent,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ascentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ascentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ascentKeys.feeds() });
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });

  return { createAscentMutation, updateAscentMutation, deleteAscentMutation };
}

export function useAscentReactionMutations() {
  const queryClient = useQueryClient();

  const addReactionMutation = useMutation({
    mutationFn: ({ ascentId, emoji }: { ascentId: string; emoji: string }) =>
      addAscentReaction(ascentId, { emoji }),
    onSuccess: (_, { ascentId }) => {
      queryClient.invalidateQueries({ queryKey: ascentKeys.detail(ascentId) });
      queryClient.invalidateQueries({ queryKey: ascentKeys.feeds() });
      queryClient.invalidateQueries({ queryKey: ascentKeys.lists() });
    },
  });

  const deleteReactionMutation = useMutation({
    mutationFn: (ascentId: string) => deleteAscentReaction(ascentId),
    onSuccess: (_, ascentId) => {
      queryClient.invalidateQueries({ queryKey: ascentKeys.detail(ascentId) });
      queryClient.invalidateQueries({ queryKey: ascentKeys.feeds() });
      queryClient.invalidateQueries({ queryKey: ascentKeys.lists() });
    },
  });

  return { addReactionMutation, deleteReactionMutation };
}
