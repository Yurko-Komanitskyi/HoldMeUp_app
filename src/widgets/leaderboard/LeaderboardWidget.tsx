import * as React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, Users2, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import type { LeaderboardEntry, LeaderboardPeriod, LeaderboardScope } from '@/entities/leaderboard/model/types';
import { useLeaderboardQuery } from '@/entities/leaderboard/model/leaderboardHooks';
import {
  loadCustomLeaderboardRivalIds,
  saveCustomLeaderboardRivalIds,
} from '@/entities/leaderboard/lib/customLeaderboardRivalsStorage';
import { LeaderboardPodium } from './ui/LeaderboardPodium';
import { LeaderboardRow } from './ui/LeaderboardRow';
import { CustomPickerModal } from './ui/CustomPickerModal';
import { initialsInCircleTextStyle } from './lib/initialsInCircleTextStyle';

const SCOPES: { key: LeaderboardScope; label: string; Icon: LucideIcon }[] = [
  { key: 'gym',     label: 'Зал',   Icon: Building2 },
  { key: 'friends', label: 'Друзі', Icon: Users2 },
  { key: 'custom',  label: 'Свої',  Icon: Zap },
];

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'week',  label: 'Тиждень' },
  { key: 'month', label: 'Місяць' },
  { key: 'all',   label: 'Весь час' },
];

// Single-row filter bar height
const FILTER_BAR_CONTENT_H = 62;
const FLOATING_RANK_H = 74;

function usePulse() {
  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      true,
    );
  }, []);
  return useAnimatedStyle(() => ({ opacity: pulse.value }));
}

function SkeletonPodium() {
  const animStyle = usePulse();
  const cols = [
    { flex: 1 as const, size: 58, height: 88 },
    { flex: 1.12 as const, size: 72, height: 124 },
    { flex: 1 as const, size: 58, height: 82 },
  ] as const;
  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 6, paddingBottom: 0 }}>
      <Animated.View
        style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4, minHeight: 278 }, animStyle]}
      >
        {cols.map((c, i) => (
          <View key={i} style={{ flex: c.flex, minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
            <View
              style={{
                width: c.size,
                height: c.size,
                borderRadius: c.size / 2,
                backgroundColor: 'rgba(255,255,255,0.38)',
              }}
            />
            <View
              style={{
                width: '100%',
                maxWidth: i === 1 ? 112 : 100,
                height: c.height,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.22)',
              }}
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function SkeletonRows() {
  const colors = useThemeColor();
  const animStyle = usePulse();
  return (
    <Animated.View style={[{ paddingTop: 22, paddingHorizontal: 16, gap: 22, backgroundColor: colors.background }, animStyle]}>
      {[1, 0.85, 0.7, 0.55, 0.4].map((op, i) => (
        <View key={i}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              opacity: op,
              paddingVertical: 4,
            }}
          >
            <View style={{ width: 34, height: 14, borderRadius: 4, backgroundColor: colors.muted, flexShrink: 0 }} />
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: colors.muted,
                flexShrink: 0,
              }}
            />
            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, gap: 8 }}>
              <View style={{ height: 14, borderRadius: 7, backgroundColor: colors.muted, width: '58%' }} />
              <View style={{ height: 11, borderRadius: 5, backgroundColor: colors.muted, width: '36%' }} />
            </View>
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, marginLeft: 18, backgroundColor: colors.border, opacity: 0.85 }} />
        </View>
      ))}
    </Animated.View>
  );
}

function BottomFilterBar({
  scope,
  period,
  onScopeChange,
  onPeriodChange,
  onPickCustom,
  bottomInset,
}: {
  scope: LeaderboardScope;
  period: LeaderboardPeriod;
  onScopeChange: (k: LeaderboardScope) => void;
  onPeriodChange: (p: LeaderboardPeriod) => void;
  onPickCustom: () => void;
  bottomInset: number;
}) {
  const colors = useThemeColor();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: bottomInset,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 6 }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.muted,
            borderRadius: 12,
            padding: 3,
            gap: 2,
          }}
        >
          {SCOPES.map(({ key, Icon }) => {
            const active = scope === key;
            return (
              <Pressable
                key={key}
                onPress={() => onScopeChange(key)}
                style={{
                  paddingHorizontal: 11,
                  paddingVertical: 8,
                  borderRadius: 9,
                  backgroundColor: active ? colors.card : 'transparent',
                  shadowColor: active ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: active ? 0.08 : 0,
                  shadowRadius: 2,
                  elevation: active ? 2 : 0,
                }}
              >
                <Icon
                  size={15}
                  color={active ? ACCENT : colors.mutedForeground}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </Pressable>
            );
          })}
        </View>

        {scope === 'custom' && (
          <Pressable
            onPress={onPickCustom}
            style={{
              flexShrink: 0,
              paddingHorizontal: 8,
              paddingVertical: 8,
              borderRadius: 9,
              borderWidth: 1,
              borderColor: ACCENT + '60',
              backgroundColor: ACCENT + '12',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: ACCENT }}>Змінити</Text>
          </Pressable>
        )}
      </View>

      <View
        style={{
          width: StyleSheet.hairlineWidth,
          height: 22,
          backgroundColor: colors.border,
          flexShrink: 0,
        }}
      />

      <View
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          minWidth: 0,
          flexDirection: 'row',
          backgroundColor: colors.muted,
          borderRadius: 12,
          padding: 3,
          gap: 2,
        }}
      >
        {PERIODS.map(({ key, label }) => {
          const active = period === key;
          return (
            <Pressable
              key={key}
              onPress={() => onPeriodChange(key)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 8,
                borderRadius: 9,
                backgroundColor: active ? colors.card : 'transparent',
                shadowColor: active ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: active ? 0.08 : 0,
                shadowRadius: 2,
                elevation: active ? 2 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: active ? '700' : '500',
                  color: active ? ACCENT : colors.mutedForeground,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FloatingMyRank({ entry, bottom }: { entry: LeaderboardEntry; bottom: number }) {
  const colors = useThemeColor();
  const name = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || entry.userTag || '?';
  const initials =
    entry.firstName && entry.lastName
      ? `${entry.firstName[0]}${entry.lastName[0]}`.toUpperCase()
      : (entry.userTag ?? '?').slice(0, 2).toUpperCase();
  const rankStr = String(entry.rank).padStart(2, '0');
  const nameColor = colors.isDark ? ACCENT : colors.chart1;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      style={{
        position: 'absolute',
        bottom,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          width: '100%',
          backgroundColor: colors.background,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: ACCENT + '35',
          paddingVertical: 12,
          paddingHorizontal: 14,
          gap: 12,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: '900',
            color: colors.foreground,
            width: 34,
            flexShrink: 0,
            textAlign: 'left',
            fontVariant: ['tabular-nums'],
          }}
        >
          {rankStr}
        </Text>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: colors.muted,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={initialsInCircleTextStyle(14, colors.primary, '800')}>{initials}</Text>
        </View>
        <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: nameColor }} numberOfLines={1}>
            {name}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.mutedForeground, marginTop: 2 }}>
            {entry.score.totalPoints.toLocaleString()} балів
          </Text>
        </View>
        <View
          style={{
            backgroundColor: ACCENT,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.4 }}>ТИ</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function EmptyState({
  scope,
  onPickCustom,
}: {
  scope: LeaderboardScope;
  onPickCustom: () => void;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Users2 size={36} color="#fff" />
      </View>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' }}>
        {scope === 'friends' ? 'Немає даних по друзях' : 'Оберіть суперників'}
      </Text>
      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 21 }}>
        {scope === 'friends'
          ? 'Підпишись на когось у Пошуку, щоб побачити їх у рейтингу'
          : 'Вибери людей, з якими хочеш змагатись'}
      </Text>
      {scope === 'custom' && (
        <Pressable
          onPress={onPickCustom}
          style={{
            marginTop: 8,
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: '#fff',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '800', color: ACCENT }}>
            Обрати суперників
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function LeaderboardWidget() {
  const colors = useThemeColor();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentUser = useUserStore((s) => s.currentUser);
  const gymId = useGymMemberStore((s) => s.currentGymId);
  const currentUserId = currentUser?.id ?? '';

  const filterBarH = FILTER_BAR_CONTENT_H + insets.bottom;

  const [scope, setScope] = React.useState<LeaderboardScope>('gym');
  const [period, setPeriod] = React.useState<LeaderboardPeriod>('month');
  const [customIds, setCustomIds] = React.useState<Set<string>>(new Set());
  const [rivalsHydrated, setRivalsHydrated] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!currentUserId) {
      setCustomIds(new Set());
      setRivalsHydrated(true);
      return;
    }
    let cancelled = false;
    setCustomIds(new Set());
    setRivalsHydrated(false);
    void (async () => {
      const ids = await loadCustomLeaderboardRivalIds(currentUserId);
      if (cancelled) return;
      setCustomIds(new Set(ids));
      setRivalsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  React.useEffect(() => {
    if (!rivalsHydrated || !currentUserId) return;
    void saveCustomLeaderboardRivalIds(currentUserId, customIds);
  }, [customIds, currentUserId, rivalsHydrated]);

  const queryParams = React.useMemo(() => {
    const base = { scope, period };
    if (scope === 'gym') return { ...base, gymId: gymId ?? undefined };
    if (scope === 'custom') {
      const ids = new Set(customIds);
      if (currentUserId) ids.add(currentUserId);
      return { ...base, userIds: [...ids].sort() };
    }
    return base;
  }, [scope, period, gymId, customIds, currentUserId]);

  const isCustomEmpty = scope === 'custom' && customIds.size === 0;

  const { data: entries = [], isLoading, isError } = useLeaderboardQuery(
    queryParams,
    !isCustomEmpty,
  );

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const isEmpty = entries.length === 0 && !isLoading;
  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const showFloatingRank = !!currentUserEntry && currentUserEntry.rank > 3;

  const hasData = !isLoading && !isError && !isCustomEmpty && !isEmpty;

  const handleUserPress = (userId: string) => {
    if (userId === currentUserId) {
      router.push('/(tabs)/profile' as never);
    } else {
      router.push(`/user/${userId}` as never);
    }
  };

  const handleScopeChange = (key: LeaderboardScope) => {
    setScope(key);
    if (key === 'custom' && customIds.size === 0) setPickerOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: ACCENT }}>
      {/* Header — on theme background */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 14,
            gap: 10,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              padding: 6,
              borderRadius: 10,
              backgroundColor: colors.muted,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ArrowLeft size={20} color={colors.foreground} />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.foreground }}>
            Рейтинг
          </Text>
        </View>
      </SafeAreaView>

      {/* Empty state — stays on ACCENT bg */}
      {!isLoading && !isError && (isCustomEmpty || isEmpty) && (
        <EmptyState scope={scope} onPickCustom={() => setPickerOpen(true)} />
      )}

      {/* Skeleton podium while loading */}
      {isLoading && <SkeletonPodium />}

      {/* Real podium — on ACCENT bg */}
      {hasData && top3.length > 0 && (
        <LeaderboardPodium top3={top3} onPressEntry={handleUserPress} />
      )}

      {/* White card — loading / error / list */}
      {(isLoading || isError || hasData) && (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: 'hidden',
            marginTop: -10,
            zIndex: 2,
          }}
        >
          {isLoading ? (
            <SkeletonRows />
          ) : isError ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>
                Не вдалося завантажити
              </Text>
              <Text style={{ fontSize: 13, color: colors.mutedForeground, textAlign: 'center' }}>
                Перевір з'єднання та спробуй ще раз
              </Text>
            </View>
          ) : (
            <>
              {/* Count label */}
              <Animated.View
                entering={FadeInUp.delay(60).springify().damping(20)}
                style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.mutedForeground,
                    letterSpacing: 1.4,
                  }}
                >
                  {entries.length} УЧАСНИКІВ
                </Text>
              </Animated.View>

              <FlatList
                key={`${scope}-${period}`}
                style={{ flex: 1, backgroundColor: colors.background }}
                data={rest}
                keyExtractor={(e) => e.userId}
                renderItem={({ item, index }) => (
                  <LeaderboardRow
                    entry={item}
                    index={index}
                    onPress={() => handleUserPress(item.userId)}
                  />
                )}
                contentContainerStyle={{
                  paddingBottom: showFloatingRank ? FLOATING_RANK_H + 8 : 12,
                }}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>
      )}

      {/* Bottom filter bar */}
      <BottomFilterBar
        scope={scope}
        period={period}
        onScopeChange={handleScopeChange}
        onPeriodChange={setPeriod}
        onPickCustom={() => setPickerOpen(true)}
        bottomInset={insets.bottom}
      />

      {/* Floating my rank — sits above the filter bar */}
      {showFloatingRank && currentUserEntry && (
        <FloatingMyRank entry={currentUserEntry} bottom={filterBarH} />
      )}

      <CustomPickerModal
        visible={pickerOpen}
        selectedIds={customIds}
        currentUserId={currentUserId}
        onClose={() => setPickerOpen(false)}
        onConfirm={(ids) => {
          setCustomIds(ids);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}
