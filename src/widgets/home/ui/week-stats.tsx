import * as React from 'react';
import { View } from 'react-native';
import { TrendingUp, Zap, Target } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

interface WeekStatsProps {
  total:     number | string;
  success:   number | string;
  flash:     number | string;
}

export function WeekStats({ total, success, flash }: WeekStatsProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  const cardBg = colors.card;
  const borderColor = colors.border;

  const cards = [
    { label: t('home.statAscents'), value: total, icon: TrendingUp, color: ACCENT },
    { label: t('home.statSuccess'), value: success, icon: Target, color: colors.chart2 },
    { label: t('home.statFlash'), value: flash, icon: Zap, color: colors.chart4 },
  ] as const;

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Animated.Text
        entering={FadeInDown.delay(0).duration(350).springify().damping(18)}
        style={{
          fontSize: 13,
          fontWeight: '700',
          letterSpacing: 0.8,
          color: colors.mutedForeground,
          marginBottom: 12,
        }}>
        {t('home.weekStats').toUpperCase()}
      </Animated.Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {cards.map((s, i) => (
          <Animated.View
            key={s.label}
            entering={FadeInDown.delay(60 + i * 80).duration(400).springify().damping(16).stiffness(120)}
            style={{
              flex: 1,
              backgroundColor: cardBg,
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor,
              gap: 8,
            }}>
            <Icon as={s.icon} size={16} color={s.color} />
            <Text
              style={{
                fontSize: 24,
                fontWeight: '800',
                color: colors.foreground,
                letterSpacing: -0.5,
              }}>
              {s.value}
            </Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontWeight: '600' }}>
              {s.label}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
