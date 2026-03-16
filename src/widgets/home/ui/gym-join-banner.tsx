import * as React from 'react';
import {
  View, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { MapPin, Dumbbell, CheckCircle, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { fetchAutoJoinGyms, gymKeys, joinGym } from '@/entities/gym/api/gymApi';
import { gymMemberKeys } from '@/entities/gym-member/api/gymMemberApi';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import type { Gym } from '@/entities/gym/model/gym';

function GymCard({ gym, onJoin, joining, joined }: {
  gym: Gym;
  onJoin: (id: string) => void;
  joining: boolean;
  joined: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg     = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <View
      style={{
        width: 220,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: joined ? ACCENT + '60' : borderColor,
        backgroundColor: joined ? ACCENT + '08' : cardBg,
        padding: 16,
        gap: 12,
      }}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: ACCENT + '18', alignItems: 'center', justifyContent: 'center' }}>
        <Dumbbell size={22} color={ACCENT} />
      </View>

      <View style={{ gap: 4, flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#fff' : '#000' }} numberOfLines={2}>
          {gym.name}
        </Text>
        {gym.address ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
            <Text style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', flex: 1 }} numberOfLines={1}>
              {gym.address}
            </Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={() => !joined && onJoin(gym.id)}
        disabled={joining || joined}
        style={{
          height: 38,
          borderRadius: 12,
          backgroundColor: joined ? ACCENT + '20' : ACCENT,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          opacity: joining ? 0.6 : 1,
        }}>
        {joining ? (
          <ActivityIndicator size="small" color={joined ? ACCENT : '#fff'} />
        ) : joined ? (
          <>
            <CheckCircle size={15} color={ACCENT} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: ACCENT }}>Приєднались</Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Приєднатись</Text>
            <ChevronRight size={14} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

export function GymJoinBanner() {
  const { colorScheme } = useColorScheme();
  const isDark      = colorScheme === 'dark';
  const queryClient = useQueryClient();
  const setMemberships  = useGymMemberStore((s) => s.setMemberships);
  const setCurrentGymId = useGymMemberStore((s) => s.setCurrentGymId);

  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(new Set());

  const { data: gyms = [], isLoading, isError } = useQuery({
    queryKey: gymKeys.autoJoin(),
    queryFn: fetchAutoJoinGyms,
    staleTime: 5 * 60 * 1000,
  });

  async function handleJoin(gymId: string) {
    setJoiningId(gymId);
    try {
      await joinGym(gymId);
      setJoinedIds((prev) => new Set([...prev, gymId]));
      setCurrentGymId(gymId);
      await queryClient.invalidateQueries({ queryKey: [...gymMemberKeys.all, 'me'] });
    } catch {
    } finally {
      setJoiningId(null);
    }
  }

  if (isLoading) {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <View style={{ height: 160, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={ACCENT} />
        </View>
      </View>
    );
  }

  if (isError || gyms.length === 0) return null;

  return (
    <View style={{ gap: 12 }}>
      <View style={{ paddingHorizontal: 16, gap: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: isDark ? '#fff' : '#000' }}>
          Обери свій зал
        </Text>
        <Text style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
          Приєднайся до залу, щоб бачити маршрути та відстежувати підйоми
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {gyms.map((gym) => (
          <GymCard
            key={gym.id}
            gym={gym}
            onJoin={handleJoin}
            joining={joiningId === gym.id}
            joined={joinedIds.has(gym.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
