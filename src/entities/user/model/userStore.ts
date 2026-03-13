import { create } from 'zustand';
import type { User } from './types';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';
type Language = 'ua' | 'en';

type UserStore = {
  currentUser: User | null;
  isLoading: boolean;
  theme: Theme;
  language: Language;

  setUser: (user: User | null) => void;
  setLoading: (value: boolean) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoading: false,
      theme: 'dark',
      language: 'ua',

      setUser: (user) => set({ currentUser: user }),
      setLoading: (value) => set({ isLoading: value }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),

      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'climbcore-user-storage',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        currentUser: state.currentUser,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
