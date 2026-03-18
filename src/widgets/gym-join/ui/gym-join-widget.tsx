import * as React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Dumbbell, ChevronLeft, Users, RefreshCw } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { parseApiError } from '@/shared/lib/api-error';
import { ACCENT } from '@/shared/config/palette';
import { useAutoJoinGymsQuery, useGymMutations } from '@/entities/gym/model/gymHooks';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { GymCard } from '../../../entities/gym/ui/gym-card';

export function GymJoinWidget() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const setCurrentGymId = useGymMemberStore((s) => s.setCurrentGymId);

  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(new Set());
  const [joinErrors, setJoinErrors] = React.useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: gyms = [], isLoading, isError, refetch } = useAutoJoinGymsQuery();
  const { joinGymMutation } = useGymMutations();
  async function handleJoin(gymId: string) {
    setJoiningId(gymId);
    setJoinErrors((prev) => {
      const n = { ...prev };
      delete n[gymId];
      return n;
    });
    try {
      await joinGymMutation.mutateAsync(gymId);
      setJoinedIds((prev) => new Set([...prev, gymId]));
      setCurrentGymId(gymId);
      setTimeout(() => router.replace('/'), 800);
    } catch (e: unknown) {
      const { message, fieldErrors } = parseApiError(e);
      setJoinErrors((prev) => ({ ...prev, [gymId]: Object.values(fieldErrors)[0] || message }));
    } finally {
      setJoiningId(null);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const bgColor = isDark ? '#000' : '#f2f2f7';
  const textColor = isDark ? '#fff' : '#000';
  const canGoBack = router.canGoBack?.() ?? false;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {canGoBack && (
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
          }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }>
        <View style={{ gap: 6, marginBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: isDark ? '#fff' : '#000' }}>
            Обери свій зал
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              lineHeight: 20,
            }}>
            Приєднайся до залу, щоб бачити маршрути та відстежувати свої підйоми
          </Text>
        </View>

        {isLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : isError ? (
          <View style={{ alignItems: 'center', gap: 16, paddingVertical: 48 }}>
            <Text
              style={{
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                textAlign: 'center',
              }}>
              Не вдалося завантажити список залів
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                padding: 12,
                borderRadius: 12,
                backgroundColor: ACCENT + '15',
              }}>
              <RefreshCw size={16} color={ACCENT} />
              <Text style={{ color: ACCENT, fontWeight: '600' }}>Спробувати знову</Text>
            </TouchableOpacity>
          </View>
        ) : gyms.length === 0 ? (
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 48 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: ACCENT + '15',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
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

        <View
          style={{
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
          <Users
            size={18}
            color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
            style={{ marginTop: 1 }}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              lineHeight: 20,
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            }}>
            Якщо вашого залу немає у списку — попросіть адміна залу вас додати вручну
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
