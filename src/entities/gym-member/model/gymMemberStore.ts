import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GymMember } from './gym-member';

type GymMemberStore = {
  memberships: GymMember[];
  currentGymId: string | null;

  setMemberships: (memberships: GymMember[]) => void;
  setCurrentGymId: (gymId: string | null) => void;
  clearAll: () => void;
};

export const useGymMemberStore = create<GymMemberStore>()(
  persist(
    (set, get) => ({
      memberships: [],
      currentGymId: null,

      setMemberships: (memberships) => {
        set({ memberships });

        const { currentGymId } = get();
        if (!currentGymId && memberships.length > 0) {
          set({ currentGymId: memberships[0].gym.id });
        }
      },

      setCurrentGymId: (gymId) => set({ currentGymId: gymId }),
      clearAll: () => set({ memberships: [], currentGymId: null }),
    }),
    {
      name: 'climbcore-gym-member-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currentGymId: state.currentGymId }),
    }
  )
);
