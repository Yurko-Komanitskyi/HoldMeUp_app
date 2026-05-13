import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';

import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import { useMyAchievementsQuery, useRecalculateAchievements } from '@/entities/achievement/model/achievementHooks';
import type { UserAchievementDto, AchievementRarity, AchievementCondition } from '@/entities/achievement/api/types';

const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: 'Звичайна',
  rare: 'Рідкісна',
  epic: 'Епічна',
  legendary: 'Легендарна',
};

const RARITY_XP: Record<AchievementRarity, number> = {
  common: 10,
  rare: 25,
  epic: 50,
  legendary: 100,
};

const RARITY_ORDER: AchievementRarity[] = ['legendary', 'epic', 'rare', 'common'];

function getProgressMax(condition: AchievementCondition): number | undefined {
  if (condition.type === 'count') return condition.threshold;
  if (condition.type === 'first_event') return 1;
  if (condition.type === 'all') {
    // use the max threshold among sub-conditions
    const maxes = condition.conditions.map(getProgressMax).filter((v): v is number => v !== undefined);
    return maxes.length > 0 ? Math.max(...maxes) : undefined;
  }
  return undefined;
}

function AchievementCard({ item, index }: { item: UserAchievementDto; index: number }) {
  const colors = useThemeColor();
  const { achievement, progress, earnedAt } = item;
  const isEarned = earnedAt !== null;
  const rarityColor = RARITY_COLORS[achievement.rarity];
  const progressMax = getProgressMax(achievement.condition);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify().damping(18)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isEarned ? rarityColor + '40' : colors.border,
          borderWidth: 1,
          opacity: isEarned ? 1 : 0.7,
        },
      ]}
    >
      {isEarned && (
        <View style={[styles.rarityLine, { backgroundColor: rarityColor }]} />
      )}

      <View style={styles.cardContent}>
        <View
          style={[
            styles.emojiContainer,
            { backgroundColor: isEarned ? rarityColor + '18' : colors.muted },
          ]}
        >
          <Text style={[styles.emoji, { opacity: isEarned ? 1 : 0.4 }]}>
            {achievement.emoji}
          </Text>
          {!isEarned && (
            <View style={[styles.lockOverlay, { backgroundColor: colors.muted + 'cc' }]}>
              <Lock size={14} color={colors.mutedForeground} />
            </View>
          )}
        </View>

        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: isEarned ? colors.foreground : colors.mutedForeground },
              ]}
              numberOfLines={1}
            >
              {achievement.title}
            </Text>
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: isEarned ? rarityColor + '20' : colors.muted },
              ]}
            >
              <Text style={[styles.rarityLabel, { color: isEarned ? rarityColor : colors.mutedForeground }]}>
                {RARITY_LABELS[achievement.rarity]}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.description,
              { color: isEarned ? colors.foreground : colors.mutedForeground },
            ]}
            numberOfLines={2}
          >
            {achievement.description}
          </Text>

          {!isEarned && progressMax !== undefined && progressMax > 1 && (
            <View style={styles.progressWrapper}>
              <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, (progress / progressMax) * 100)}%`,
                      backgroundColor: rarityColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                {progress}/{progressMax}
              </Text>
            </View>
          )}

          {isEarned && earnedAt && (
            <Text style={[styles.earnedDate, { color: colors.mutedForeground }]}>
              Отримано{' '}
              {new Date(earnedAt).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function SectionHeader({ title, count, delay }: { title: string; count: number; delay: number }) {
  const colors = useThemeColor();
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(20)}
      style={styles.sectionHeader}
    >
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={[styles.countBadge, { backgroundColor: colors.muted }]}>
        <Text style={[styles.countText, { color: colors.mutedForeground }]}>{count}</Text>
      </View>
    </Animated.View>
  );
}

export function AchievementsWidget() {
  const colors = useThemeColor();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data = [], isLoading, isError, refetch } = useMyAchievementsQuery();
  const { mutate: recalculate } = useRecalculateAchievements();

  React.useEffect(() => { recalculate(); }, []);

  const earned = data.filter((a) => a.earnedAt !== null);
  const locked = data.filter((a) => a.earnedAt === null);

  const totalPoints = earned.reduce((acc, a) => acc + RARITY_XP[a.achievement.rarity], 0);
  const total = data.length;

  const earnedByRarity = RARITY_ORDER.map((r) => ({
    rarity: r,
    items: earned.filter((a) => a.achievement.rarity === r),
  })).filter((g) => g.items.length > 0);

  const lockedByRarity = RARITY_ORDER.map((r) => ({
    rarity: r,
    items: locked.filter((a) => a.achievement.rarity === r),
  })).filter((g) => g.items.length > 0);

  let cardIndex = 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ArrowLeft size={20} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Досягнення</Text>
            {total > 0 && (
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                {earned.length} з {total} відкрито
              </Text>
            )}
          </View>
          {earned.length > 0 && (
            <View style={[styles.pointsChip, { backgroundColor: ACCENT + '18', borderColor: ACCENT + '40' }]}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: ACCENT }}>
                {totalPoints} XP
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Progress bar */}
      {total > 0 && (
        <View style={[styles.overallProgress, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.overallTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.overallFill,
                {
                  width: `${(earned.length / total) * 100}%`,
                  backgroundColor: ACCENT,
                },
              ]}
            />
          </View>
          <Text style={[styles.overallText, { color: colors.mutedForeground }]}>
            {Math.round((earned.length / total) * 100)}%
          </Text>
        </View>
      )}

      {/* Loading */}
      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.foreground }]}>
            Не вдалося завантажити
          </Text>
          <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: ACCENT + '20' }]}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: ACCENT }}>Спробувати знову</Text>
          </Pressable>
        </View>
      )}

      {/* Empty */}
      {!isLoading && !isError && data.length === 0 && (
        <View style={styles.centered}>
          <Text style={{ fontSize: 40 }}>🏆</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Поки що порожньо</Text>
          <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
            Лізь і досягнення з'являться самі
          </Text>
        </View>
      )}

      {/* List */}
      {!isLoading && !isError && data.length > 0 && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {earned.length > 0 && (
            <>
              <SectionHeader title="Отримані 🎉" count={earned.length} delay={0} />
              {earnedByRarity.map((group) =>
                group.items.map((item) => (
                  <AchievementCard key={item.id} item={item} index={cardIndex++} />
                ))
              )}
            </>
          )}

          {locked.length > 0 && (
            <>
              <SectionHeader title="Ще не відкрито 🔒" count={locked.length} delay={100} />
              {lockedByRarity.map((group) =>
                group.items.map((item) => (
                  <AchievementCard key={item.id} item={item} index={cardIndex++} />
                ))
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
  },
  pointsChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  overallProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overallTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  overallFill: {
    height: '100%',
    borderRadius: 3,
  },
  overallText: {
    fontSize: 12,
    fontWeight: '700',
    width: 34,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  rarityLine: {
    height: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: {
    fontSize: 26,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  rarityLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
  earnedDate: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
