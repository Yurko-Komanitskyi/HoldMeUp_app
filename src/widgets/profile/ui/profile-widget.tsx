import * as React from 'react';
import {
  View,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  TrendingUp,
  Zap,
  Target,
  Settings,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Mountain,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  FadeInDown,
} from 'react-native-reanimated';

import { Text } from '@/shared/ui/text';
import { ACCENT, resolveRouteColor } from '@/shared/config/palette';
import { StatPill } from '@/shared/ui/stat-pill';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useMyStatsQuery } from '@/entities/stats/model/statsHooks';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';
import { ProfileSettingsModal } from '@/widgets/profile/ui/profile-settings-modal';
import { ClimbingStatsCard } from '@/widgets/user-profile/ui/public-user-profile';
import { useAscentsQuery } from '@/entities/ascent/model/ascentHooks';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useScrollToTopOnFocus } from '@/shared/hooks/use-scroll-to-top-on-focus';
import { Icon } from '@/shared/ui/icon';
import type { Ascent, AscentReaction } from '@/entities/ascent/model/ascent';

const GRID_PREVIEW_COUNT = 9;
const GRID_GAP = 8;
const REACTION_PREVIEW_LIMIT = 2;
const PARALLAX_RANGE = 100;

function aggregateReactions(reactions: AscentReaction[]): Array<{ emoji: string; count: number }> {
  const byEmoji = new Map<string, number>();
  for (const reaction of reactions) {
    byEmoji.set(reaction.emoji, (byEmoji.get(reaction.emoji) ?? 0) + 1);
  }
  return Array.from(byEmoji.entries())
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count);
}

type GroupedProfileAscent = Ascent & {
  groupedCount: number;
  groupedReactions: AscentReaction[];
};

function groupConsecutiveAscentsByRoute(items: Ascent[]): GroupedProfileAscent[] {
  const grouped: GroupedProfileAscent[] = [];
  for (const item of items) {
    const previous = grouped[grouped.length - 1];
    if (previous && previous.routeId === item.routeId) {
      previous.groupedCount += 1;
      previous.groupedReactions.push(...(item.reactions ?? []));
      continue;
    }
    grouped.push({
      ...item,
      groupedCount: 1,
      groupedReactions: [...(item.reactions ?? [])],
    });
  }
  return grouped;
}

export function ProfileAscentTile({
  ascentId,
  width,
  height,
  routeName,
  routeGrade,
  routeColor,
  success,
  reactions,
  groupedCount,
}: {
  ascentId: string;
  width: number;
  height: number;
  routeName: string | null;
  routeGrade: string | null;
  routeColor: string | null;
  success: boolean;
  reactions?: AscentReaction[];
  groupedCount?: number;
}) {
  const router = useRouter();
  const colors = useThemeColor();
  const fill = resolveRouteColor((routeColor ?? 'grey').trim());

  const statusColor = success ? '#10b981' : colors.mutedForeground;
  const reactionPreview = React.useMemo(
    () => aggregateReactions(reactions ?? []).slice(0, REACTION_PREVIEW_LIMIT),
    [reactions]
  );

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/ascent-detail/${ascentId}` as never)}
      style={{
        width: width,
        height: height,
        borderRadius: 12,
        backgroundColor: colors.card || '#ffffff',
        borderWidth: 1,
        borderColor: colors.border || 'rgba(0,0,0,0.05)',
        padding: 8,
      }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: fill,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(0,0,0,0.2)',
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {groupedCount && groupedCount > 1 ? (
            <View
              style={{
                minWidth: 24,
                height: 18,
                borderRadius: 9,
                paddingHorizontal: 6,
                backgroundColor: colors.border + '80',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.foreground }}>
                x{groupedCount}
              </Text>
            </View>
          ) : null}
          <Icon as={success ? CheckCircle2 : XCircle} size={16} color={statusColor} />
        </View>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: colors.foreground,
          }}>
          {routeGrade || '-'}
        </Text>

        {routeName ? (
          <Text
            numberOfLines={1}
            style={{
              fontSize: 10,
              fontWeight: '500',
              color: colors.mutedForeground,
              marginTop: 2,
              textAlign: 'center',
            }}>
            {routeName}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 18 }}>
        {reactionPreview.map((reaction) => (
          <View
            key={reaction.emoji}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 999,
              paddingHorizontal: 5,
              paddingVertical: 2,
              backgroundColor: ACCENT + '22',
            }}>
            <Text style={{ fontSize: 10 }}>{reaction.emoji}</Text>
            <Text style={{ marginLeft: 2, fontSize: 9, fontWeight: '800', color: ACCENT }}>
              {reaction.count}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export function ProfileWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const colors = useThemeColor();
  const user = useUserStore((s) => s.currentUser);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const memberships = useGymMemberStore((s) => s.memberships);

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const profileScrollRef = useScrollToTopOnFocus<Animated.ScrollView>();

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Avatar: scale down + translate up as you scroll
  const avatarStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, PARALLAX_RANGE], [1, 0.65], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, PARALLAX_RANGE * 0.8], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, PARALLAX_RANGE], [0, -18], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY }], opacity };
  });

  // Name + tag: slide up + fade
  const nameStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [20, PARALLAX_RANGE * 0.9], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, PARALLAX_RANGE], [0, -12], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  // Stats row: fade in slightly later (reveal after avatar leaves)
  const statsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [60, PARALLAX_RANGE], [1, 0.3], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, PARALLAX_RANGE], [0, -8], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const {
    data: profileStats,
    isError: profileStatsError,
    error: profileStatsQueryError,
    isLoading: profileStatsLoading,
    refetch: refetchProfileStats,
  } = useMyStatsQuery({ period: 'all', compareWithPrevious: false }, { enabled: !!user });

  const ascentsTotal = profileStats?.current?.totalAscents ?? 0;
  const flashCount = profileStats?.current?.byType?.FLASH ?? 0;
  const successCount = profileStats?.current?.successfulAscents ?? 0;

  const {
    items: ascentItems,
    isLoading: ascentsLoading,
    isError: ascentsError,
    error: ascentsQueryError,
    refetch: refetchAscents,
  } = useAscentsQuery(undefined, { enabled: !!user });

  const previewAscents = React.useMemo(() => {
    const grouped = groupConsecutiveAscentsByRoute(ascentItems);
    return grouped.slice(0, GRID_PREVIEW_COUNT);
  }, [ascentItems]);

  const currentGym = React.useMemo(
    () => memberships.find((m) => m.gym.id === currentGymId)?.gym,
    [memberships, currentGymId]
  );

  const initials =
    (user?.firstName?.charAt(0) ?? '') + (user?.lastName?.charAt(0) ?? '') ||
    (user?.email?.charAt(0)?.toUpperCase() ?? '?');

  const horizontalPad = 16;
  const gridWidth = windowWidth - horizontalPad * 2;
  const tileSize = Math.floor((gridWidth - GRID_GAP * 2) / 3);
  const tileHeight = tileSize * 0.9;

  return (
    <Animated.ScrollView
      ref={profileScrollRef}
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}>
      <ProfileSettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <View className="absolute right-3 top-0" style={{ zIndex: 10 }}>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          hitSlop={12}
          style={{ padding: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t('profile.settingsModalTitle')}>
          <Settings size={24} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Parallax header block */}
      <View className="items-center gap-3 px-4 pt-1">
        <Animated.View style={avatarStyle}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: ACCENT + '18',
              borderWidth: 3,
              borderColor: ACCENT + '55',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 34, fontWeight: '800', color: ACCENT, lineHeight: 40 }}>
              {initials}
            </Text>
          </View>
        </Animated.View>

        <Animated.View className="items-center gap-1" style={nameStyle}>
          <Text className="text-center text-2xl font-bold text-foreground">
            {[user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
              t('profile.defaultName')}
          </Text>
          {user?.userTag ? (
            <Text className="text-sm font-medium text-muted-foreground">@{user.userTag}</Text>
          ) : null}
        </Animated.View>
      </View>

      {/* Stats row with parallax */}
      {profileStatsError && !profileStatsLoading ? (
        <View className="mt-4 px-4">
          <QueryErrorPanel
            variant="compact"
            error={profileStatsQueryError ?? new Error('')}
            onRetry={() => void refetchProfileStats()}
          />
        </View>
      ) : (
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 24,
              paddingHorizontal: 16,
            },
            statsStyle,
          ]}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.foreground }}>
              {ascentsTotal}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <TrendingUp size={14} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: colors.mutedForeground }}>
                {t('profile.statAscents')}
              </Text>
            </View>
          </View>

          <View style={{ width: 1, height: 32, backgroundColor: colors.border }} />

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.foreground }}>
              {flashCount}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Zap size={14} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: colors.mutedForeground }}>
                {t('profile.statFlash')}
              </Text>
            </View>
          </View>

          <View style={{ width: 1, height: 32, backgroundColor: colors.border }} />

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.foreground }}>
              {successCount}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Target size={14} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: colors.mutedForeground }}>
                {t('profile.statSuccess')}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      <View
        style={{
          marginTop: 22,
          marginHorizontal: horizontalPad,
          height: 1,
          backgroundColor: colors.border,
        }}
      />

      {/* Content sections — staggered entrance */}
      <Animated.View
        entering={FadeInDown.delay(80).duration(420).springify().damping(18)}
        style={{ marginTop: 20, paddingHorizontal: horizontalPad }}>
        <ClimbingStatsCard ascents={ascentItems as Ascent[]} showWhenEmpty />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(180).duration(420).springify().damping(18)}
        className="mt-5 px-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-bold text-foreground">{t('profile.ascentsSection')}</Text>
          <Pressable
            onPress={() => router.push('/ascents/ascents' as never)}
            hitSlop={8}
            className="flex-row items-center gap-0.5">
            <Text className="text-sm font-semibold" style={{ color: ACCENT }}>
              {t('profile.viewAllAscents')}
            </Text>
            <ChevronRight size={18} color={ACCENT} />
          </Pressable>
        </View>

        {ascentsLoading && previewAscents.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : ascentsError && previewAscents.length === 0 ? (
          <View style={{ paddingVertical: 16 }}>
            <QueryErrorPanel
              variant="compact"
              error={ascentsQueryError ?? new Error('')}
              onRetry={() => void refetchAscents()}
            />
          </View>
        ) : previewAscents.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              borderRadius: 16,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: colors.border,
              paddingVertical: 36,
              paddingHorizontal: 24,
            }}>
            <Mountain size={36} color={colors.mutedForeground} />
            <Text
              style={{
                marginTop: 12,
                fontSize: 15,
                fontWeight: '600',
                color: colors.mutedForeground,
                textAlign: 'center',
              }}>
              {t('ascents.noAscents')}
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontSize: 13,
                color: colors.mutedForeground,
                textAlign: 'center',
              }}>
              {t('ascents.logFirst')}
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: GRID_GAP,
              justifyContent: 'flex-start',
            }}>
            {previewAscents.map((a, i) => (
              <Animated.View
                key={a.id}
                entering={FadeInDown.delay(260 + i * 45).duration(350).springify().damping(16)}>
                <ProfileAscentTile
                  ascentId={a.id}
                  width={tileSize}
                  height={tileHeight}
                  routeName={a.routeName?.trim() ?? null}
                  routeGrade={a.routeGrade ?? null}
                  routeColor={a.routeColor ?? null}
                  success={a.success}
                  reactions={a.groupedReactions}
                  groupedCount={a.groupedCount}
                />
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>
    </Animated.ScrollView>
  );
}
