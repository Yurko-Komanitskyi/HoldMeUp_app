import * as React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Dumbbell, ChevronLeft, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { parseApiError } from '@/shared/lib/api-error';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useAutoJoinGymsQuery, useGymMutations } from '@/entities/gym/model/gymHooks';
import { gymKeys } from '@/entities/gym/api/gymApi';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { GymCard } from '../../../entities/gym/ui/gym-card';
import { useTranslation } from 'react-i18next';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

export function GymJoinWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const colors = useThemeColor();
  const isDark = colors.isDark;

  const setCurrentGymId = useGymMemberStore((s) => s.setCurrentGymId);

  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(new Set());
  const [joinErrors, setJoinErrors] = React.useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: gyms = [], isLoading, isError, error: gymsQueryError, refetch } = useAutoJoinGymsQuery();
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
    try {
      await queryClient.invalidateQueries({ queryKey: gymKeys.autoJoin() });
      await queryClient.refetchQueries({ queryKey: gymKeys.autoJoin(), type: 'active' });
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  const bgColor = colors.background;
  const textColor = colors.foreground;
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
            borderBottomColor: colors.border,
          }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: colors.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ChevronLeft size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: textColor }}>{t('gym.findGym')}</Text>
        </View>
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }>
        <Animated.View
          entering={FadeInDown.delay(0).duration(380).springify().damping(18)}
          style={{ gap: 6, marginBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.foreground }}>
            {t('gym.pickYourGym')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.mutedForeground,
              lineHeight: 20,
            }}>
            {t('gym.joinSubtitle')}
          </Text>
        </Animated.View>

        {isLoading ? (
          <Animated.View
            entering={FadeIn.delay(80).duration(300)}
            style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color={ACCENT} />
          </Animated.View>
        ) : isError ? (
          <Animated.View entering={FadeInDown.delay(80).duration(360).springify().damping(18)}>
            <QueryErrorPanel error={gymsQueryError ?? new Error('')} onRetry={() => void refetch()} />
          </Animated.View>
        ) : gyms.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(80).duration(380).springify().damping(18)}
            style={{ alignItems: 'center', gap: 12, paddingVertical: 48 }}>
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
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              {t('gym.noGyms')}
            </Text>
          </Animated.View>
        ) : (
          gyms.map((gym, index) => (
            <Animated.View
              key={gym.id}
              entering={FadeInDown.delay(80 + index * 70).duration(380).springify().damping(18)}>
              <GymCard
                gym={gym}
                onJoin={handleJoin}
                joining={joiningId === gym.id}
                joined={joinedIds.has(gym.id)}
                error={joinErrors[gym.id]}
              />
            </Animated.View>
          ))
        )}

        <Animated.View
          entering={FadeInDown.delay(200).duration(380).springify().damping(18)}
          style={{
            marginTop: 8,
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.muted,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
          }}>
          <Users
            size={18}
            color={colors.mutedForeground}
            style={{ marginTop: 1 }}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              lineHeight: 20,
              color: colors.mutedForeground,
            }}>
            {t('gym.footerHint')}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
