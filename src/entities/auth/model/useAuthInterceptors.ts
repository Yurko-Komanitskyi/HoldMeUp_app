import { useEffect, useCallback } from 'react';
import { setSignOutCallback } from '@/shared/api/axios';
import { useUserStore } from '@/entities/user/model/userStore';

/**
 * Підключає callback для axios interceptor.
 * Axios сам очищає токени з SecureStore при 401.
 * Цей хук тільки очищає Zustand-стан → React рендерить <Redirect>.
 */
export function useAuthInterceptors() {
  const setUser = useUserStore((state) => state.setUser);

  const signOut = useCallback(() => {
    setUser(null);
  }, [setUser]);

  useEffect(() => {
    setSignOutCallback(signOut);
    return () => setSignOutCallback(null);
  }, [signOut]);
}
