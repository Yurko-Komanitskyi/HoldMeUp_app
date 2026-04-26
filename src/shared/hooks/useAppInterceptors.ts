import { useEffect, useCallback } from 'react';
import { setSignOutCallback } from '@/shared/api/axios';
import { useUserStore } from '@/entities/user/model/userStore';

export function useAppInterceptors() {
  const setUser = useUserStore((state) => state.setUser);

  const signOut = useCallback(() => {
    setUser(null);
  }, [setUser]);

  useEffect(() => {
    setSignOutCallback(signOut);
    return () => setSignOutCallback(null);
  }, [signOut]);
}
