import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '@/shared/model/types';

type UserStore = {
  user: User | null;

  setUser: (user: User | null) => void;
  clearAll: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),
      clearAll: () => set({ user: null }),
    }),
    {
      name: 'climbcore-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
