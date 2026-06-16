import * as React from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useAutoJoinGymsQuery, useGymMutations } from '@/entities/gym/model/gymHooks';
import { GymCompactCard } from '@/widgets/routes/ui/gym-compact-card';
import { useTranslation } from 'react-i18next';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

export function GymJoinBanner() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const setCurrentGymId = useGymMemberStore((s) => s.setCurrentGymId);

  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(new Set());

  const { data: gyms = [], isLoading, isError, error: gymsQueryError, refetch } = useAutoJoinGymsQuery();
  const { joinGymMutation } = useGymMutations();

  async function handleJoin(gymId: string) {
    setJoiningId(gymId);
    try {
      await joinGymMutation.mutateAsync(gymId);
      setJoinedIds((prev) => new Set([...prev, gymId]));
      setCurrentGymId(gymId);
    } catch (error) {
      console.error('Failed to join gym:', error);
    } finally {
      setJoiningId(null);
    }
  }

  if (isLoading) {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <View
          style={{
            height: 160,
            borderRadius: 20,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator color={ACCENT} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <QueryErrorPanel
          variant="compact"
          error={gymsQueryError ?? new Error('')}
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  if (gyms.length === 0) return null;

  return (
    <View style={{ gap: 12 }}>
      <Animated.View
        entering={FadeInDown.delay(0).duration(380).springify().damping(18)}
        style={{ paddingHorizontal: 16, gap: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: isDark ? '#fff' : '#000' }}>
          {t('home.gymBannerTitle')}
        </Text>
        <Text style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
          {t('home.gymBannerSubtitle')}
        </Text>
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {gyms.map((gym, index) => (
          <Animated.View
            key={gym.id}
            entering={FadeInDown.delay(60 + index * 60).duration(360).springify().damping(18)}>
            <GymCompactCard
              gym={gym}
              onJoin={handleJoin}
              joining={joiningId === gym.id}
              joined={joinedIds.has(gym.id)}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}
