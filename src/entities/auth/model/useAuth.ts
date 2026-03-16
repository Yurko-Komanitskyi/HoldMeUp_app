import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { authApi } from '../api/authApi';
import { authSecureStore } from './authSecureStore';
import type { RegisterInput, UpdateMeInput } from '../api/types';

export function useAuth() {
  const setUser = useUserStore((state) => state.setUser);

  async function login(email: string, password: string) {
    const result = await authApi.login({ email, password });
    await authSecureStore.saveAccessToken(result.token);
    await authSecureStore.saveRefreshToken(result.refreshToken);
    setUser(result.user);
    return result;
  }

  async function register(input: RegisterInput) {
    await authApi.register(input);
  }

  async function logout() {
    authApi.logout().catch(() => {});
    await authSecureStore.logout();
    useGymMemberStore.getState().clearAll();
    setUser(null);
  }

  async function updateMe(input: UpdateMeInput) {
    const user = await authApi.updateMe(input);
    setUser(user);
    return user;
  }

  async function deleteMe() {
    await authApi.deleteMe();
    authApi.logout().catch(() => {});
    await authSecureStore.logout();
    setUser(null);
  }

  return { login, register, logout, updateMe, deleteMe };
}
