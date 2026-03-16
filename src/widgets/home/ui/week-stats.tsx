import * as React from 'react';
import { View } from 'react-native';
import { TrendingUp, Zap, Target } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { ACCENT } from '@/shared/config/palette';

interface WeekStatsProps {
  total:     number | string;
  success:   number | string;
  flash:     number | string;
}

export function WeekStats({ total, success, flash }: WeekStatsProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardBg     = isDark ? '#1c1c1e' : '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  const cards = [
    { label: t('home.statAscents'), value: total,   icon: TrendingUp, color: ACCENT    },
    { label: t('home.statSuccess'), value: success,  icon: Target,     color: '#22c55e' },
    { label: t('home.statFlash'),   value: flash,    icon: Zap,        color: '#eab308' },
  ] as const;

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          letterSpacing: 0.8,
          color: 'rgba(128,128,128,0.6)',
          marginBottom: 12,
        }}>
        {t('home.weekStats').toUpperCase()}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {cards.map((s) => (
          <View
            key={s.label}
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
            <Text style={{ fontSize: 24, fontWeight: '800', color: isDark ? '#fff' : '#000', letterSpacing: -0.5 }}>
              {s.value}
            </Text>
            <Text style={{ fontSize: 11, color: 'rgba(128,128,128,0.6)', fontWeight: '600' }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
