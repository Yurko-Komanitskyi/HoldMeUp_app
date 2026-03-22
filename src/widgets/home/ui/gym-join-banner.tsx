import * as React from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
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
      <View style={{ paddingHorizontal: 16, gap: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: isDark ? '#fff' : '#000' }}>
          {t('home.gymBannerTitle')}
        </Text>
        <Text style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
          {t('home.gymBannerSubtitle')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {gyms.map((gym) => (
          <GymCompactCard
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
