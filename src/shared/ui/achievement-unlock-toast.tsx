import * as React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { Text } from '@/shared/ui/text';
import type { UserAchievementDto, AchievementRarity } from '@/entities/achievement/api/types';

// ─── Store ────────────────────────────────────────────────────────────────────

interface AchievementToastState {
  queue: UserAchievementDto[];
  enqueue: (items: UserAchievementDto[]) => void;
  shift: () => void;
}

export const useAchievementToastStore = create<AchievementToastState>((set) => ({
  queue: [],
  enqueue: (items) =>
    set((s) => ({ queue: [...s.queue, ...items] })),
  shift: () =>
    set((s) => ({ queue: s.queue.slice(1) })),
}));

// ─── Colors ───────────────────────────────────────────────────────────────────

const RARITY_COLORS: Record<AchievementRarity, { bg: string; accent: string; label: string }> = {
  common:    { bg: '#f3f4f6', accent: '#6b7280', label: 'Звичайна'  },
  rare:      { bg: '#eff6ff', accent: '#3b82f6', label: 'Рідкісна'  },
  epic:      { bg: '#faf5ff', accent: '#a855f7', label: 'Епічна'    },
  legendary: { bg: '#fffbeb', accent: '#f59e0b', label: 'Легендарна'},
};

const DARK_RARITY_COLORS: Record<AchievementRarity, { bg: string; accent: string; label: string }> = {
  common:    { bg: '#1f2937', accent: '#9ca3af', label: 'Звичайна'  },
  rare:      { bg: '#1e3a5f', accent: '#60a5fa', label: 'Рідкісна'  },
  epic:      { bg: '#2e1a47', accent: '#c084fc', label: 'Епічна'    },
  legendary: { bg: '#3d2e00', accent: '#fbbf24', label: 'Легендарна'},
};

const DISPLAY_DURATION = 4000;
const SLIDE_CONFIG = { damping: 16, stiffness: 200 };

// ─── Single toast card ────────────────────────────────────────────────────────

interface ToastCardProps {
  item: UserAchievementDto;
  isDark: boolean;
  bottomInset: number;
  onDismiss: () => void;
}

function ToastCard({ item, isDark, bottomInset, onDismiss }: ToastCardProps) {
  const { achievement } = item;
  const palette = isDark
    ? DARK_RARITY_COLORS[achievement.rarity]
    : RARITY_COLORS[achievement.rarity];

  const translateY = useSharedValue(200);
  const opacity = useSharedValue(0);

  const dismiss = React.useCallback(() => {
    'worklet';
    translateY.value = withTiming(200, { duration: 280 }, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
    opacity.value = withTiming(0, { duration: 240 });
  }, [translateY, opacity, onDismiss]);

  React.useEffect(() => {
    translateY.value = withSpring(0, SLIDE_CONFIG);
    opacity.value = withTiming(1, { duration: 220 });

    const timer = setTimeout(() => dismiss(), DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, [dismiss, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.wrapper, { bottom: bottomInset + 16 }, animStyle]}>
      <Pressable onPress={dismiss} style={[styles.card, { backgroundColor: palette.bg }]}>
        {/* top accent line */}
        <View style={[styles.accentLine, { backgroundColor: palette.accent }]} />

        <View style={styles.row}>
          {/* emoji */}
          <View style={[styles.emojiBox, { backgroundColor: palette.accent + '22' }]}>
            <Text style={styles.emoji}>{achievement.emoji}</Text>
          </View>

          {/* text */}
          <View style={styles.textCol}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: palette.accent + '28' }]}>
                <Text style={[styles.badgeText, { color: palette.accent }]}>
                  {palette.label}
                </Text>
              </View>
              <Text style={[styles.unlocked, { color: palette.accent }]}>
                Нове досягнення!
              </Text>
            </View>
            <Text style={[styles.title, { color: isDark ? '#f9fafb' : '#111827' }]}>
              {achievement.title}
            </Text>
            <Text style={[styles.desc, { color: isDark ? '#9ca3af' : '#6b7280' }]} numberOfLines={2}>
              {achievement.description}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Overlay (mount once in root layout) ─────────────────────────────────────

export function AchievementUnlockOverlay({ isDark }: { isDark: boolean }) {
  const insets = useSafeAreaInsets();
  const queue = useAchievementToastStore((s) => s.queue);
  const shift = useAchievementToastStore((s) => s.shift);

  const current = queue[0];

  if (!current) return null;

  return (
    <ToastCard
      key={current.id}
      item={current}
      isDark={isDark}
      bottomInset={insets.bottom}
      onDismiss={shift}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  accentLine: {
    height: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  emojiBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: {
    fontSize: 28,
  },
  textCol: {
    flex: 1,
    gap: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  unlocked: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
  },
});
