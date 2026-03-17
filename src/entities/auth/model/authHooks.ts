import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, authKeys } from '../api/authApi';
import { authSecureStore } from './authSecureStore';
import { useUserStore } from '../model/userStore';

export function useMeQuery() {
  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
  });

  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}

export function useMeMutation() {
  const queryClient = useQueryClient();
  const setUser = useUserStore((s) => s.setUser);

  const updateMeMutation = useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });

  const deleteMeMutation = useMutation({
    mutationFn: async () => {
      await authApi.deleteMe();
      authApi.logout().catch(() => {});
      await authSecureStore.logout();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    },
  });

  return { updateMe: updateMeMutation, deleteMe: deleteMeMutation };
}

export function useAuth() {
  const queryClient = useQueryClient();
  const setUser = useUserStore((s) => s.setUser);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: Parameters<typeof authApi.login>[0]) => {
      const result = await authApi.login({ email, password });
      await authSecureStore.saveAccessToken(result.token);
      await authSecureStore.saveRefreshToken(result.refreshToken);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      authApi.logout().catch(() => {});
      await authSecureStore.logout();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
  });

  return {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    forgotPassword: forgotPasswordMutation,
  };
}
