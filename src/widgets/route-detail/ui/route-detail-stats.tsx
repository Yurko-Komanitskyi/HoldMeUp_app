import * as React from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { useTranslation } from 'react-i18next';

type StatCardProps = {
  value: string | number;
  label: string;
  color: string;
  isDark: boolean;
};

function StatCard({ value, label, color, isDark }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
      }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          letterSpacing: 0.3,
          marginBottom: 6,
        }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 20,
          fontWeight: '800',
          color,
          letterSpacing: -0.5,
        }}>
        {value}
      </Text>
    </View>
  );
}

type Props = {
  ascentCount: number;
  flashRate: number | string | null;
  flashCount: number;
  rating: number | string | null;
  isDark: boolean;
};

export function RouteDetailStats({ ascentCount, flashRate, flashCount, rating, isDark }: Props) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 20 }}>
      <StatCard value={ascentCount} label={t('routeDetail.statAscents')} color="#7badcf" isDark={isDark} />
      {flashRate !== null ? (
        <StatCard value={`${flashRate}%`} label={t('routeDetail.statFlash')} color="#f59e0b" isDark={isDark} />
      ) : (
        <StatCard value={flashCount} label={t('routeDetail.statFlash')} color="#f59e0b" isDark={isDark} />
      )}
      {rating !== null ? (
        <StatCard value={`★ ${rating}`} label={t('routeDetail.statRating')} color="#a78bfa" isDark={isDark} />
      ) : (
        <StatCard
          value="—"
          label={t('routeDetail.statRating')}
          color={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
          isDark={isDark}
        />
      )}
    </View>
  );
}
