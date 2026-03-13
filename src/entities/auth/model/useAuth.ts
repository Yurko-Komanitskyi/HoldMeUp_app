import { useUserStore } from '@/entities/user/model/userStore';
import { authApi } from '../api/authApi';
import { authSecureStore } from './authSecureStore';

export function useAuth() {
  const setUser = useUserStore((state) => state.setUser);
  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    setUser(result.user);
    await authSecureStore.saveRefreshToken(result.refreshToken);
    await authSecureStore.saveAccessToken(result.token);

    return result;
  };

  const refresh = async () => {
    const refreshToken = await authSecureStore.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }
    const result = await authApi.refresh(refreshToken);
    await authSecureStore.saveRefreshToken(result.refreshToken);
    await authSecureStore.saveAccessToken(result.token);

    return result.token;
  };

  const logout = async () => {
    await authSecureStore.logout();
    setUser(null);
  };

  const getMe = async () => {
    const result = await authApi.getMe();
    setUser(result);
    return result;
  };

  return { login, logout, refresh, getMe };
}
