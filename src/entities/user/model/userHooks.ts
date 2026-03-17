import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchUsers,
  fetchUserById,
  fetchRoles,
  fetchStatuses,
  createUser,
  updateUser,
  deleteUser,
  userKeys,
  type UserListFilters,
} from '../api/userApi';

export function useUsersQuery(filters?: UserListFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
  });
}

export function useUserDetailsQuery(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });
}

export function useRolesQuery() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: fetchRoles,
  });
}

export function useStatusesQuery() {
  return useQuery({
    queryKey: userKeys.statuses(),
    queryFn: fetchStatuses,
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
  });

  return { createUserMutation, updateUserMutation, deleteUserMutation };
}
