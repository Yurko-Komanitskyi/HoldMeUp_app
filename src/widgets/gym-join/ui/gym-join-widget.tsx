import * as React from 'react';
import {
  View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, MapPin, CheckCircle, ChevronRight, ChevronLeft, Users, RefreshCw } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { parseApiError } from '@/shared/lib/api-error';
import { ACCENT } from '@/shared/config/palette';
import { fetchAutoJoinGyms, gymKeys, joinGym } from '@/entities/gym/api/gymApi';
import { gymMemberKeys } from '@/entities/gym-member/api/gymMemberApi';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import type { Gym } from '@/entities/gym/model/gym';

function GymCard({
  gym, onJoin, joining, joined, error,
}: {
  gym: Gym;
  onJoin: (id: string) => void;
  joining: boolean;
  joined: boolean;
  error?: string | null;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg    = isDark ? 'rgba(255,255,255,0.04)' : '#fff';
  const borderCol = joined
    ? ACCENT + '60'
    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: borderCol,
        backgroundColor: joined ? ACCENT + '06' : cardBg,
        padding: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View style={{
          width: 48, height: 48, borderRadius: 14,
          backgroundColor: ACCENT + '18',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Dumbbell size={22} color={ACCENT} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#fff' : '#000' }}>
            {gym.name}
          </Text>
          {gym.address ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
              <Text style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', flex: 1 }}>
                {gym.address}
              </Text>
            </View>
          ) : null}
          {gym.description ? (
            <Text style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', marginTop: 2 }} numberOfLines={2}>
              {gym.description}
            </Text>
          ) : null}
        </View>
      </View>

      {error ? (
        <Text style={{ fontSize: 12, color: '#ef4444', textAlign: 'center' }}>{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={() => !joined && onJoin(gym.id)}
        disabled={joining || joined}
        style={{
          height: 44,
          borderRadius: 14,
          backgroundColor: joined ? ACCENT + '15' : ACCENT,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: joining ? 0.7 : 1,
        }}>
        {joining ? (
          <ActivityIndicator size="small" color={joined ? ACCENT : '#fff'} />
        ) : joined ? (
          <>
            <CheckCircle size={16} color={ACCENT} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: ACCENT }}>Приєднались!</Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Приєднатись</Text>
            <ChevronRight size={15} color="rgba(255,255,255,0.8)" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

export function GymJoinWidget() {
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const setCurrentGymId = useGymMemberStore((s) => s.setCurrentGymId);

  const [joiningId,   setJoiningId]   = React.useState<string | null>(null);
  const [joinedIds,   setJoinedIds]   = React.useState<Set<string>>(new Set());
  const [joinErrors,  setJoinErrors]  = React.useState<Record<string, string>>({});
  const [refreshing,  setRefreshing]  = React.useState(false);

  const { data: gyms = [], isLoading, isError, refetch } = useQuery({
    queryKey: gymKeys.autoJoin(),
    queryFn:  fetchAutoJoinGyms,
    staleTime: 5 * 60 * 1000,
  });

  async function handleJoin(gymId: string) {
    setJoiningId(gymId);
    setJoinErrors((prev) => { const n = { ...prev }; delete n[gymId]; return n; });
    try {
      await joinGym(gymId);
      setJoinedIds((prev) => new Set([...prev, gymId]));
      setCurrentGymId(gymId);
      await queryClient.invalidateQueries({ queryKey: gymMemberKeys.all });
      setTimeout(() => router.replace('/'), 800);
    } catch (e: unknown) {
      const { message } = parseApiError(e);
      setJoinErrors((prev) => ({ ...prev, [gymId]: message }));
    } finally {
      setJoiningId(null);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const bgColor   = isDark ? '#000' : '#f2f2f7';
  const textColor = isDark ? '#fff' : '#000';
  const canGoBack = router.canGoBack?.() ?? false;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {canGoBack && (
        <View style={{
          paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 14,
          flexDirection: 'row', alignItems: 'center', gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            style={{
              width: 34, height: 34, borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              alignItems: 'center', justifyContent: 'center',
            }}>
            <ChevronLeft size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: textColor }}>Знайти зал</Text>
        </View>
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}>

        <View style={{ gap: 6, marginBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: isDark ? '#fff' : '#000' }}>
            Обери свій зал
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', lineHeight: 20 }}>
            Приєднайся до залу, щоб бачити маршрути та відстежувати свої підйоми
          </Text>
        </View>

        {isLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : isError ? (
          <View style={{ alignItems: 'center', gap: 16, paddingVertical: 48 }}>
            <Text style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
              Не вдалося завантажити список залів
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderRadius: 12, backgroundColor: ACCENT + '15' }}>
              <RefreshCw size={16} color={ACCENT} />
              <Text style={{ color: ACCENT, fontWeight: '600' }}>Спробувати знову</Text>
            </TouchableOpacity>
          </View>
        ) : gyms.length === 0 ? (
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 48 }}>
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: ACCENT + '15', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={32} color={ACCENT} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#000' }}>
              Залів не знайдено
            </Text>
          </View>
        ) : (
          gyms.map((gym) => (
            <GymCard
              key={gym.id}
              gym={gym}
              onJoin={handleJoin}
              joining={joiningId === gym.id}
              joined={joinedIds.has(gym.id)}
              error={joinErrors[gym.id]}
            />
          ))
        )}

        <View style={{
          marginTop: 8,
          padding: 16,
          borderRadius: 16,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <Users size={18} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Якщо вашого залу немає у списку — попросіть адміна залу вас додати вручну
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
